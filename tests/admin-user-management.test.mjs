import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import {
  CreateUserSchema,
  UpdateRoleSchema,
  DeleteUserSchema,
  ALLOWED_ROLES,
} from "../lib/validation/admin-user-schema.ts";

function loadPermissions() {
  const source = readFileSync("lib/auth/permissions.ts", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = { exports: {} };
  new Function("module", "exports", outputText)(loaded, loaded.exports);
  return loaded.exports;
}

const { hasPermission } = loadPermissions();

test("CreateUserSchema validates valid user registration payload", () => {
  const result = CreateUserSchema.safeParse({
    email: "admin-baru@kitatumbuh.id",
    password: "password123",
    fullName: "Budi Santoso",
    phone: "08123456789",
    role: "SUPER_ADMIN",
  });

  assert.ok(result.success, "Should accept valid create user payload");
  if (result.success) {
    assert.equal(result.data.email, "admin-baru@kitatumbuh.id");
    assert.equal(result.data.role, "SUPER_ADMIN");
  }
});

test("CreateUserSchema rejects invalid email or short password", () => {
  const invalidEmail = CreateUserSchema.safeParse({
    email: "bukan-email",
    password: "password123",
    fullName: "Budi Santoso",
    role: "ADMIN",
  });
  assert.ok(!invalidEmail.success, "Should reject invalid email");

  const shortPassword = CreateUserSchema.safeParse({
    email: "admin@kitatumbuh.id",
    password: "123",
    fullName: "Budi Santoso",
    role: "ADMIN",
  });
  assert.ok(!shortPassword.success, "Should reject password under 6 chars");
});

test("CreateUserSchema rejects invalid role", () => {
  const invalidRole = CreateUserSchema.safeParse({
    email: "admin@kitatumbuh.id",
    password: "password123",
    fullName: "Budi Santoso",
    role: "UNKNOWN_ROLE",
  });
  assert.ok(!invalidRole.success, "Should reject unknown role");
});

test("UpdateRoleSchema accepts valid role change and rejects invalid uuid", () => {
  const valid = UpdateRoleSchema.safeParse({
    targetUserId: "11111111-1111-4111-8111-111111111111",
    role: "SUPER_ADMIN",
  });
  assert.ok(valid.success, "Should accept valid UUID and role");

  const invalid = UpdateRoleSchema.safeParse({
    targetUserId: "not-a-uuid",
    role: "SUPER_ADMIN",
  });
  assert.ok(!invalid.success, "Should reject malformed UUID");
});

test("DeleteUserSchema validates uuid", () => {
  const valid = DeleteUserSchema.safeParse({
    targetUserId: "11111111-1111-4111-8111-111111111111",
  });
  assert.ok(valid.success, "Should accept valid UUID");

  const invalid = DeleteUserSchema.safeParse({
    targetUserId: "invalid",
  });
  assert.ok(!invalid.success, "Should reject non-uuid targetUserId");
});

test("SUPER_ADMIN has write access to user_roles module while other roles do not", () => {
  assert.equal(hasPermission("SUPER_ADMIN", "user_roles", "write"), true);
  assert.equal(hasPermission("SUPER_ADMIN", "user_roles", "read"), true);

  // ADMIN can only read, cannot write/create/delete
  assert.equal(hasPermission("ADMIN", "user_roles", "read"), true);
  assert.equal(hasPermission("ADMIN", "user_roles", "write"), false);

  // Other roles have no access
  assert.equal(hasPermission("OPERATOR", "user_roles", "read"), false);
  assert.equal(hasPermission("FINANCE", "user_roles", "read"), false);
  assert.equal(hasPermission("SOCIAL_OFFICER", "user_roles", "read"), false);
  assert.equal(hasPermission("MEMBER", "user_roles", "read"), false);
});
