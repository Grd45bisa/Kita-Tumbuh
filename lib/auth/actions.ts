"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  SignInSchema,
  SignUpSchema,
  RequestPasswordResetSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema,
  type SignInInput,
  type SignUpInput,
  type RequestPasswordResetInput,
  type UpdatePasswordInput,
  type UpdateProfileInput,
} from "@/lib/validation/auth-schema";
import type { ActionResult } from "@/types/donation";

function translateAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email atau password tidak tepat. Periksa kembali.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "Email ini sudah terdaftar. Silakan masuk menggunakan akunmu.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Terlalu banyak percobaan. Silakan tunggu beberapa saat.";
  }
  if (lower.includes("password is too short")) {
    return "Password minimal 6 karakter.";
  }
  return msg;
}

function toRecord(input: unknown): Record<string, unknown> {
  if (input instanceof FormData) {
    const res: Record<string, unknown> = {};
    input.forEach((val, key) => {
      res[key] = val;
    });
    return res;
  }
  return (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
}

/**
 * Sign In with Email & Password
 */
export async function signInAction(
  input: SignInInput | FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const parse = SignInSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Isian login belum valid. Periksa kembali email dan password.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parse.data.email,
      password: parse.data.password,
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    revalidatePath("/", "layout");
    return { success: true, data: {} };
  } catch (err) {
    console.error("[auth] signIn error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat masuk. Coba lagi dalam beberapa saat.",
    };
  }
}

/**
 * Sign Up with Full Name, Email & Password
 */
export async function signUpAction(
  input: SignUpInput | FormData
): Promise<ActionResult<{ requiresVerification: boolean }>> {
  const parse = SignUpSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Formulir pendaftaran belum lengkap. Periksa isian kamu.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: parse.data.email,
      password: parse.data.password,
      options: {
        data: {
          full_name: parse.data.full_name,
          phone: parse.data.phone || "",
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    // Defensive fallback: ensure profile row exists if user was created immediately
    if (authData.user) {
      await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          full_name: parse.data.full_name,
          phone: parse.data.phone || "",
        })
        .select()
        .maybeSingle();
    }

    revalidatePath("/", "layout");
    const requiresVerification = !authData.session;

    return {
      success: true,
      data: { requiresVerification },
    };
  } catch (err) {
    console.error("[auth] signUp error:", err);
    return {
      success: false,
      error: "Terjadi kendala saat mendaftar akun. Coba lagi nanti.",
    };
  }
}

/**
 * Sign Out
 */
export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[auth] signOut error:", err);
  }
  redirect("/login");
}

/**
 * Request Password Reset Email
 */
export async function requestPasswordResetAction(
  input: RequestPasswordResetInput | FormData
): Promise<ActionResult> {
  const parse = RequestPasswordResetSchema.safeParse(toRecord(input));
  if (!parse.success) {
    return {
      success: false,
      error: "Masukkan alamat email yang valid.",
    };
  }

  try {
    const supabase = await createClient();
    // Route through /auth/confirm first — Supabase Auth email links carry a
    // PKCE `code` that must be exchanged server-side for a real session
    // before the reset-password form can call updateUser(). See
    // app/auth/confirm/route.ts for why this indirection exists.
    const redirectTo = `${env.siteUrl}/auth/confirm?next=${encodeURIComponent(
      "/reset-password?type=recovery"
    )}`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      parse.data.email,
      { redirectTo }
    );

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    return { success: true, data: undefined };
  } catch (err) {
    console.error("[auth] resetPassword error:", err);
    return {
      success: false,
      error: "Gagal mengirimkan instruksi reset password. Coba lagi nanti.",
    };
  }
}

/**
 * Update Password (when user is authenticated)
 */
export async function updatePasswordAction(
  input: UpdatePasswordInput | FormData
): Promise<ActionResult> {
  const parse = UpdatePasswordSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Konfirmasi password baru belum sesuai.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parse.data.password,
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    return { success: true, data: undefined };
  } catch (err) {
    console.error("[auth] updatePassword error:", err);
    return {
      success: false,
      error: "Gagal memperbarui password. Silakan coba lagi.",
    };
  }
}

/**
 * Update Profile Information (Full name, phone)
 */
export async function updateProfileAction(
  input: UpdateProfileInput | FormData
): Promise<ActionResult> {
  const parse = UpdateProfileSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Periksa kembali data profil yang dimasukkan.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Sesi tidak ditemukan. Silakan masuk kembali.",
      };
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: parse.data.full_name,
        phone: parse.data.phone || "",
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[auth] updateProfile error:", error.message);
      return {
        success: false,
        error: "Gagal menyimpan perubahan profil.",
      };
    }

    revalidatePath("/profil");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[auth] updateProfile unexpected error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan tak terduga saat memperbarui profil.",
    };
  }
}
