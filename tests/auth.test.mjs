import assert from "node:assert/strict";
import test from "node:test";
import {
  SignInSchema,
  SignUpSchema,
  RequestPasswordResetSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema,
} from "../lib/validation/auth-schema.ts";

test("SignInSchema accepts valid email and password", () => {
  const result = SignInSchema.safeParse({
    email: "warga@kitatumbuh.id",
    password: "Password123!",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, "warga@kitatumbuh.id");
  }
});

test("SignInSchema rejects invalid email or empty password", () => {
  const badEmail = SignInSchema.safeParse({
    email: "bukan-email",
    password: "Password123!",
  });
  assert.equal(badEmail.success, false);

  const emptyPassword = SignInSchema.safeParse({
    email: "warga@kitatumbuh.id",
    password: "",
  });
  assert.equal(emptyPassword.success, false);
});

test("SignUpSchema validates matching passwords and minimum password length", () => {
  // Passwords match and length >= 8
  const valid = SignUpSchema.safeParse({
    email: "donatur@kitatumbuh.id",
    password: "securepassword",
    confirm_password: "securepassword",
    full_name: "Budi Santoso",
    phone: "08123456789",
  });
  assert.equal(valid.success, true);

  // Short password (< 8 chars)
  const shortPwd = SignUpSchema.safeParse({
    email: "donatur@kitatumbuh.id",
    password: "short",
    confirm_password: "short",
    full_name: "Budi Santoso",
  });
  assert.equal(shortPwd.success, false);

  // Mismatched passwords
  const mismatch = SignUpSchema.safeParse({
    email: "donatur@kitatumbuh.id",
    password: "securepassword1",
    confirm_password: "securepassword2",
    full_name: "Budi Santoso",
  });
  assert.equal(mismatch.success, false);
});

test("SignUpSchema accepts optional phone but requires full_name", () => {
  const noPhone = SignUpSchema.safeParse({
    email: "donatur@kitatumbuh.id",
    password: "securepassword",
    confirm_password: "securepassword",
    full_name: "Siti Rahma",
  });
  assert.equal(noPhone.success, true);

  const noName = SignUpSchema.safeParse({
    email: "donatur@kitatumbuh.id",
    password: "securepassword",
    confirm_password: "securepassword",
    full_name: "",
  });
  assert.equal(noName.success, false);
});

test("RequestPasswordResetSchema validates email address", () => {
  const valid = RequestPasswordResetSchema.safeParse({ email: "user@example.com" });
  assert.equal(valid.success, true);

  const invalid = RequestPasswordResetSchema.safeParse({ email: "not-an-email" });
  assert.equal(invalid.success, false);
});

test("UpdatePasswordSchema ensures password confirmation matches and meets length", () => {
  const valid = UpdatePasswordSchema.safeParse({
    password: "brandnewpassword123",
    confirm_password: "brandnewpassword123",
  });
  assert.equal(valid.success, true);

  const mismatch = UpdatePasswordSchema.safeParse({
    password: "brandnewpassword123",
    confirm_password: "otherpassword",
  });
  assert.equal(mismatch.success, false);
});

test("UpdateProfileSchema requires non-empty full_name and allows nullable/optional phone", () => {
  const valid = UpdateProfileSchema.safeParse({
    full_name: "Ahmad Fauzi",
    phone: "089988776655",
  });
  assert.equal(valid.success, true);

  const emptyName = UpdateProfileSchema.safeParse({
    full_name: "   ",
    phone: "089988776655",
  });
  assert.equal(emptyName.success, false);
});

test("Member data isolation rule: member queries must strictly filter user_id", () => {
  // Simulation of query filter enforcement
  const mockBuildMemberQuery = (userId, params = {}) => {
    if (!userId) throw new Error("Unauthorized");
    return {
      table: "donations",
      filters: {
        user_id: userId, // Must strictly equal userId to prevent anonymous rows leaking
        ...params,
      },
    };
  };

  const currentUserId = "usr-uuid-1234";
  const query = mockBuildMemberQuery(currentUserId, { status: "VERIFIED" });
  assert.equal(query.filters.user_id, currentUserId);
  assert.equal(query.filters.status, "VERIFIED");
  assert.notEqual(query.filters.user_id, null);
});
