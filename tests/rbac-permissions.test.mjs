import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function loadPermissions() {
  const source = readFileSync("lib/auth/permissions.ts", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = { exports: {} };
  new Function("module", "exports", outputText)(loaded, loaded.exports);
  return loaded.exports;
}

const { PERMISSION_MATRIX, hasPermission, normalizeRole } = loadPermissions();
const expected = {
  SUPER_ADMIN: ["write","write","write","write","write","write","write","write","write","write","write","write","write","read","write","write"],
  ADMIN: ["read","write","write","write","write","write","write","read","write","read","write","write","write","read","read","read"],
  OPERATOR: ["read","write","write","write","write","read","read","none","none","none","read","read","read","read","none","none"],
  FINANCE: ["read","read","read","read","read","read","write","write","read","none","write","read","write","read","none","none"],
  SOCIAL_OFFICER: ["read","read","read","read","read","read","read","read","write","write","write","write","write","read","none","none"],
};
const modules = ["dashboard","donations","pickup_collection","waste_inventory","production","product_catalog","orders_sales","finance","social_programs","beneficiaries","transparency","stories","reports","audit_log","user_roles","system_settings"];

test("permission matrix matches ARSITEKTUR section 11 for every role and module", () => {
  for (const [role, levels] of Object.entries(expected)) {
    assert.deepEqual(modules.map((module) => PERMISSION_MATRIX[role][module]), levels, role);
  }
});

test("legacy admin promotion preserves access and permission comparison is monotonic", () => {
  assert.equal(normalizeRole("admin"), "SUPER_ADMIN");
  assert.equal(normalizeRole("member"), "MEMBER");
  for (const role of Object.keys(expected)) for (const moduleName of modules) {
    const level = PERMISSION_MATRIX[role][moduleName];
    assert.equal(hasPermission(role, moduleName, "write"), level === "write", `${role}/${moduleName} write`);
    assert.equal(hasPermission(role, moduleName, "read"), level !== "none", `${role}/${moduleName} read`);
  }
});

test("required denial examples are enforced independently of UI", () => {
  assert.equal(hasPermission("OPERATOR", "beneficiaries", "write"), false);
  assert.equal(hasPermission("FINANCE", "beneficiaries", "read"), false);
  assert.equal(hasPermission("ADMIN", "finance", "write"), false);
  assert.equal(hasPermission("SOCIAL_OFFICER", "orders_sales", "write"), false);
  assert.equal(hasPermission("SUPER_ADMIN", "audit_log", "write"), false);
});

test("all ten admin domain modules replaced legacy requireAdmin boundaries", () => {
  const files = ["beneficiaries","distributions","donations","finance","inventory","orders","production","products","social-programs","waste-types"];
  for (const name of files) {
    const source = readFileSync(`lib/domain/admin/${name}.ts`, "utf8");
    assert.doesNotMatch(source, /requireAdmin\s*\(/, name);
    assert.match(source, /requirePermission\s*\(/, name);
  }
});

test("RBAC migration promotes old admins and protects sensitive tables granularly", () => {
  const sql = readFileSync("supabase/migrations/018_rbac_roles.sql", "utf8");
  assert.match(sql, /SET role = 'SUPER_ADMIN' WHERE role = 'admin'/);
  for (const role of ["SUPER_ADMIN","ADMIN","OPERATOR","FINANCE","SOCIAL_OFFICER","MEMBER"]) assert.match(sql, new RegExp(`'${role}'`));
  for (const table of ["beneficiaries","revenue_entries","social_allocations","expenses"]) {
    assert.match(sql, new RegExp(`ON public\\.${table}`));
  }
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.is_admin/);
  assert.match(sql, /IN \('SUPER_ADMIN', 'ADMIN'\)/);
});

test("audit log is append-only and critical events are wired explicitly", () => {
  const sql = readFileSync("supabase/migrations/019_audit_logs.sql", "utf8");
  assert.doesNotMatch(sql, /FOR (INSERT|UPDATE|DELETE) TO authenticated/);
  assert.match(sql, /SECURITY DEFINER/);
  assert.match(sql, /REVOKE ALL ON TABLE public\.audit_logs/);
  assert.match(sql, /TO service_role/);
  assert.doesNotMatch(sql, /GRANT EXECUTE[^;]+TO authenticated/);
  const sources = ["orders","finance","beneficiaries"].map((name) => readFileSync(`lib/domain/admin/${name}.ts`, "utf8")).join("\n");
  for (const action of ["ORDER_PAID","REVENUE_RECORDED","ALLOCATION_CREATED","BENEFICIARY_UPDATED"]) assert.match(sources, new RegExp(action));
});
