export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATOR",
  "FINANCE",
  "SOCIAL_OFFICER",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type Role = AdminRole | "MEMBER" | "PUBLIC";
export type PermissionLevel = "none" | "read" | "write";

export const MODULES = [
  "dashboard", "donations", "pickup_collection", "waste_inventory",
  "production", "product_catalog", "orders_sales", "finance",
  "social_programs", "beneficiaries", "transparency", "stories",
  "reports", "audit_log", "user_roles", "system_settings",
] as const;

export type AdminModule = (typeof MODULES)[number];

export const PERMISSION_MATRIX: Record<AdminRole, Record<AdminModule, PermissionLevel>> = {
  SUPER_ADMIN: {
    dashboard: "write", donations: "write", pickup_collection: "write",
    waste_inventory: "write", production: "write", product_catalog: "write",
    orders_sales: "write", finance: "write", social_programs: "write",
    beneficiaries: "write", transparency: "write", stories: "write",
    reports: "write", audit_log: "read", user_roles: "write", system_settings: "write",
  },
  ADMIN: {
    dashboard: "read", donations: "write", pickup_collection: "write",
    waste_inventory: "write", production: "write", product_catalog: "write",
    orders_sales: "write", finance: "read", social_programs: "write",
    beneficiaries: "read", transparency: "write", stories: "write",
    reports: "write", audit_log: "read", user_roles: "read", system_settings: "read",
  },
  OPERATOR: {
    dashboard: "read", donations: "write", pickup_collection: "write",
    waste_inventory: "write", production: "write", product_catalog: "read",
    orders_sales: "read", finance: "none", social_programs: "none",
    beneficiaries: "none", transparency: "read", stories: "read",
    reports: "read", audit_log: "read", user_roles: "none", system_settings: "none",
  },
  FINANCE: {
    dashboard: "read", donations: "read", pickup_collection: "read",
    waste_inventory: "read", production: "read", product_catalog: "read",
    orders_sales: "write", finance: "write", social_programs: "read",
    beneficiaries: "none", transparency: "write", stories: "read",
    reports: "write", audit_log: "read", user_roles: "none", system_settings: "none",
  },
  SOCIAL_OFFICER: {
    dashboard: "read", donations: "read", pickup_collection: "read",
    waste_inventory: "read", production: "read", product_catalog: "read",
    orders_sales: "read", finance: "read", social_programs: "write",
    beneficiaries: "write", transparency: "write", stories: "write",
    reports: "write", audit_log: "read", user_roles: "none", system_settings: "none",
  },
};

export function normalizeRole(role: string | null | undefined): Role {
  if (role === "admin") return "SUPER_ADMIN";
  if (role === "member") return "MEMBER";
  return ([...ADMIN_ROLES, "MEMBER", "PUBLIC"] as string[]).includes(role ?? "")
    ? (role as Role)
    : "PUBLIC";
}

export function hasPermission(
  role: string | null | undefined,
  module: AdminModule,
  required: Exclude<PermissionLevel, "none">
): boolean {
  const normalized = normalizeRole(role);
  if (!ADMIN_ROLES.includes(normalized as AdminRole)) return false;
  const actual = PERMISSION_MATRIX[normalized as AdminRole][module];
  return actual === "write" || (required === "read" && actual === "read");
}
