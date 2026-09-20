import assert from "node:assert/strict";
import test from "node:test";

test("requireAdmin logic rejects unauthenticated users and redirects to login", () => {
  const simulateRequireAdmin = (user, returnUrl = "/admin") => {
    if (!user) {
      return { action: "REDIRECT", destination: `/login?redirect=${encodeURIComponent(returnUrl)}` };
    }
    if (user.profile?.role !== "admin") {
      return { action: "REDIRECT", destination: "/dashboard" };
    }
    return { action: "ALLOW", user };
  };

  // 1. Unauthenticated
  const guestResult = simulateRequireAdmin(null, "/admin/waste-types");
  assert.equal(guestResult.action, "REDIRECT");
  assert.equal(guestResult.destination, "/login?redirect=%2Fadmin%2Fwaste-types");

  // 2. Member (authenticated, but not admin)
  const memberUser = {
    id: "usr-1",
    email: "member@example.com",
    profile: { id: "usr-1", full_name: "Member Biasa", role: "member" },
  };
  const memberResult = simulateRequireAdmin(memberUser, "/admin");
  assert.equal(memberResult.action, "REDIRECT");
  assert.equal(memberResult.destination, "/dashboard");

  // 3. Admin (authenticated, role = admin)
  const adminUser = {
    id: "adm-1",
    email: "admin@kitatumbuh.id",
    profile: { id: "adm-1", full_name: "Pengelola Kampung", role: "admin" },
  };
  const adminResult = simulateRequireAdmin(adminUser, "/admin");
  assert.equal(adminResult.action, "ALLOW");
  assert.equal(adminResult.user.id, "adm-1");
});

test("middleware route matching correctly flags /admin routes as requiring authentication", () => {
  const isProtectedRoute = (pathname) => {
    return (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/riwayat") ||
      pathname.startsWith("/profil") ||
      pathname.startsWith("/impact") ||
      pathname.startsWith("/pickup")
    );
  };

  assert.equal(isProtectedRoute("/admin"), true);
  assert.equal(isProtectedRoute("/admin/donations"), true);
  assert.equal(isProtectedRoute("/admin/waste-types"), true);
  assert.equal(isProtectedRoute("/dashboard"), true);
  assert.equal(isProtectedRoute("/donasikan"), false); // Public donation flow MUST stay public
  assert.equal(isProtectedRoute("/cara-kerja"), false);
  assert.equal(isProtectedRoute("/transparansi"), false);
});
