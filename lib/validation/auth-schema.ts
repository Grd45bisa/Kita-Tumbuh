import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter."),
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(100, "Nama lengkap maksimal 100 karakter."),
    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    phone: z
      .string()
      .trim()
      .max(25, "Nomor telepon maksimal 25 karakter.")
      .optional()
      .default(""),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter."),
    confirm_password: z
      .string()
      .min(8, "Konfirmasi password minimal 8 karakter."),
    terms_accepted: z
      .union([z.boolean(), z.string()])
      .optional()
      .default(true)
      .refine(
        (val) => val === true || val === "true" || val === "on",
        "Kamu harus menyetujui ketentuan layanan."
      ),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirm_password"],
  });

export type SignUpInput = z.infer<typeof SignUpSchema>;

export const RequestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
});

export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;

export const UpdatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password baru wajib diisi."),
    confirm_password: z
      .string()
      .min(8, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirm_password"],
  });

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;

export const UpdateProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter.")
    .max(100, "Nama lengkap maksimal 100 karakter."),
  phone: z
    .string()
    .trim()
    .max(25, "Nomor telepon maksimal 25 karakter.")
    .optional()
    .default(""),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
