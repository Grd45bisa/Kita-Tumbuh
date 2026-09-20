"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/domain/admin/audit-logs";
import {
  CreateUserSchema,
  UpdateRoleSchema,
  DeleteUserSchema,
  type CreateUserInput,
  type UpdateRoleInput,
  type DeleteUserInput,
} from "@/lib/validation/admin-user-schema";
import type { Role } from "@/lib/auth/permissions";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  emailConfirmedAt: string | null;
  createdAt: string;
}

/**
 * List all users with their authentication status and profiles.
 * Requires read permission on 'user_roles'.
 */
export async function getUsersList(): Promise<ManagedUser[]> {
  await requirePermission("user_roles", "read");

  const adminClient = createAdminClient();

  // 1. Fetch auth users from Supabase Auth Admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (authError || !authData?.users) {
    console.error("[admin/users] listUsers failed:", authError?.message);
    return [];
  }

  // 2. Fetch corresponding profile roles from public.profiles
  const { data: profiles, error: profileError } = await adminClient
    .from("profiles")
    .select("id, full_name, phone, role, created_at");

  if (profileError) {
    console.error("[admin/users] profiles query failed:", profileError.message);
  }

  const profileMap = new Map<string, { full_name: string; phone: string; role: Role; created_at: string }>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, {
      full_name: p.full_name || "",
      phone: p.phone || "",
      role: (p.role as Role) || "MEMBER",
      created_at: p.created_at,
    });
  }

  return authData.users.map((u) => {
    const p = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email || "",
      fullName: p?.full_name || (u.user_metadata?.full_name as string) || "—",
      phone: p?.phone || (u.user_metadata?.phone as string) || "—",
      role: p?.role || "MEMBER",
      emailConfirmedAt: u.email_confirmed_at || null,
      createdAt: u.created_at,
    };
  });
}

/**
 * Create a new user / admin directly without email confirmation.
 * Requires write permission on 'user_roles' (SUPER_ADMIN only).
 */
export async function createUserAction(rawInput: CreateUserInput) {
  const caller = await requirePermission("user_roles", "write");

  const validated = CreateUserSchema.parse(rawInput);
  const adminClient = createAdminClient();

  // Create user in Supabase Auth with email_confirm = true (instant activation)
  const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
    email: validated.email,
    password: validated.password,
    email_confirm: true,
    user_metadata: {
      full_name: validated.fullName,
      phone: validated.phone || "",
    },
  });

  if (createError || !authUser?.user) {
    return {
      success: false,
      error: createError?.message || "Gagal membuat pengguna di sistem autentikasi.",
    };
  }

  const newUserId = authUser.user.id;

  // Ensure profile exists and has the intended role
  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: newUserId,
      full_name: validated.fullName,
      phone: validated.phone || "",
      role: validated.role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("[admin/users] profile upsert failed:", profileError.message);
  }

  // Audit log
  await recordAuditLog({
    actorId: caller.id,
    action: "CREATE_USER",
    entityType: "user",
    entityId: newUserId,
    newValue: { email: validated.email, role: validated.role, fullName: validated.fullName },
    reason: `Akun dibuat oleh Super Admin (${caller.email}) dengan role ${validated.role} tanpa konfirmasi email.`,
  });

  revalidatePath("/admin/users");
  return { success: true, userId: newUserId };
}

/**
 * Update a user's role.
 * Requires write permission on 'user_roles' (SUPER_ADMIN only).
 */
export async function updateUserRoleAction(rawInput: UpdateRoleInput) {
  const caller = await requirePermission("user_roles", "write");
  const validated = UpdateRoleSchema.parse(rawInput);

  const adminClient = createAdminClient();

  // Fetch previous role for audit log
  const { data: currentProfile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", validated.targetUserId)
    .maybeSingle();

  const oldRole = currentProfile?.role || "MEMBER";

  const { error } = await adminClient
    .from("profiles")
    .update({ role: validated.role, updated_at: new Date().toISOString() })
    .eq("id", validated.targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit log
  await recordAuditLog({
    actorId: caller.id,
    action: "UPDATE_USER_ROLE",
    entityType: "user",
    entityId: validated.targetUserId,
    oldValue: { role: oldRole },
    newValue: { role: validated.role },
    reason: `Role pengguna diubah dari ${oldRole} ke ${validated.role} oleh ${caller.email}.`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Delete a user completely from auth and profile.
 * Requires write permission on 'user_roles' (SUPER_ADMIN only).
 */
export async function deleteUserAction(rawInput: DeleteUserInput) {
  const caller = await requirePermission("user_roles", "write");
  const validated = DeleteUserSchema.parse(rawInput);

  // Safety guard: prevent self-deletion
  if (caller.id === validated.targetUserId) {
    return {
      success: false,
      error: "Anda tidak dapat menghapus akun Anda sendiri.",
    };
  }

  const adminClient = createAdminClient();

  // Get target user details before deletion for audit trail
  const { data: targetAuthUser } = await adminClient.auth.admin.getUserById(validated.targetUserId);
  const targetEmail = targetAuthUser?.user?.email || validated.targetUserId;

  // 1. Delete from Supabase Auth
  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(validated.targetUserId);
  if (deleteAuthError) {
    return { success: false, error: deleteAuthError.message };
  }

  // 2. Cascade cleanup from profiles (in case trigger hasn't fired)
  await adminClient.from("profiles").delete().eq("id", validated.targetUserId);

  // 3. Audit log
  await recordAuditLog({
    actorId: caller.id,
    action: "DELETE_USER",
    entityType: "user",
    entityId: validated.targetUserId,
    oldValue: { email: targetEmail },
    reason: `Akun ${targetEmail} dihapus oleh Super Admin (${caller.email}).`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}
