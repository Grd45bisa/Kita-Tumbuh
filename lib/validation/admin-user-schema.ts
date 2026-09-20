import { z } from "zod";

export const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATOR",
  "FINANCE",
  "SOCIAL_OFFICER",
  "MEMBER",
] as const;

export type ManagedRole = (typeof ALLOWED_ROLES)[number];

export const CreateUserSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter"),
  phone: z.string().trim().optional().or(z.literal("")),
  role: z.enum(ALLOWED_ROLES, {
    message: "Role yang dipilih tidak valid",
  }),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateRoleSchema = z.object({
  targetUserId: z.string().uuid("ID pengguna tidak valid"),
  role: z.enum(ALLOWED_ROLES, {
    message: "Role yang dipilih tidak valid",
  }),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;

export const DeleteUserSchema = z.object({
  targetUserId: z.string().uuid("ID pengguna tidak valid"),
});

export type DeleteUserInput = z.infer<typeof DeleteUserSchema>;
