# PRODUCTION RUNBOOK & DEPLOYMENT CHECKLIST
## KITA TUMBUH / Kampung Smart Farming

> **Target Platform:** Next.js (Vercel / Node.js Server) + Supabase PostgreSQL  
> **Status:** Production Readiness Guide (Phase 18)

---

## 1. Environment & Secrets Configuration (P0-1801)

### Required Production Environment Variables
Set the following environment variables in your hosting provider (e.g. Vercel Project Settings) or production `.env`:

| Variable Name | Description | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL (e.g. `https://kitatumbuh.id`) | Client & Server |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://<project-ref>.supabase.co`) | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous public key (read-only / RLS governed) | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role key (for internal admin/audit jobs only) | **SERVER ONLY** (Never expose to browser) |

### Supabase Auth Configuration
In the Supabase Dashboard (`Authentication -> URL Configuration`):
1. **Site URL:** Set to `https://kitatumbuh.id` (or primary production domain).
2. **Redirect URLs (Allow list):**
   - `https://kitatumbuh.id/auth/confirm`
   - `https://kitatumbuh.id/dashboard`
   - `https://kitatumbuh.id/login`

---

## 2. Database Migration & RLS Enforcement (P0-1801)

### Migration Order
Apply migrations sequentially from `supabase/migrations/`:
```bash
# Apply all schema migrations in order:
# 001_donation_foundation.sql
# ... through ...
# 021_waste_lot_mutation_hardening.sql
npx supabase db push
```

### Critical RLS & Permission Verification
Verify the following database-level guarantees before pointing traffic to production:
1. **Public/Anonymous Access:**
   - Table `donations` has `donations_owner_read` restricting rows to the authenticated donor or unassigned records.
   - Raw tables `production_batches`, `batch_inputs`, `social_allocations`, and `beneficiaries` **must not** have permissive public SELECT policies.
   - Public impact queries must invoke the narrow SECURITY DEFINER RPCs (`017_public_impact_aggregation.sql`).
2. **Write RPC Authorization:**
   - Critical mutation RPCs (`execute_order_stock_decrement`, `allocate_order_social_revenue`, `record_distribution`, `execute_waste_lot_mutation`) have `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC` and are granted only to `authenticated` with an in-function `has_permission()` check (ADR-028).

---

## 3. Observability & Error Monitoring (P0-1802)

1. **Error Tracking:**
   - Integrate Sentry (`@sentry/nextjs`) by supplying `NEXT_PUBLIC_SENTRY_DSN` in production.
   - Configure global error boundary (`app/global-error.tsx`) to capture uncaught React rendering crashes.
2. **Audit Logs:**
   - Audit trail is append-only via table `audit_logs`.
   - Critical events (role modification, inventory adjustment, batch completion, order payment confirmation) must be verified via `/admin/audit-logs`.
3. **Uptime & Health Checks:**
   - Configure health check pings to `/robots.txt` or `/` via UptimeRobot / BetterStack.

---

## 4. Backup & Disaster Recovery (P0-1803)

1. **Automated Database Backups:**
   - Ensure Supabase Daily Backup is active (enabled by default on Supabase Pro tiers).
   - For point-in-time recovery (PITR), enable WAL archiving in Supabase Database settings.
2. **Manual Snapshot Procedure:**
   ```bash
   pg_dump -h db.<project-ref>.supabase.co -U postgres -d postgres --clean --if-exists > backup_$(date +%Y%m%d_%H%M%S).sql
   ```
3. **Recovery Verification:**
   - Test restoring the SQL dump into an isolated staging project once per quarter.

---

## 5. SEO & Discoverability Verification (P0-1804)

- **Robots.txt:** `/robots.txt` dynamically disallows `/admin/`, `/dashboard/`, `/auth/`, `/donasi/sukses`.
- **Sitemap:** `/sitemap.xml` indexes all 10 canonical public routes (`/`, `/donasikan`, `/cara-kerja`, `/faq`, `/tentang-kami`, `/collection-point`, `/produk`, `/program`, `/dampak`, `/transparansi`).
- **Structured Data:**
  - Organization & WebSite JSON-LD present on `/`.
  - BreadcrumbList JSON-LD present on every nested public subpage.
- **Canonical URLs:** All `<link rel="canonical">` tags resolve to the canonical site URL from `env.siteUrl`.

---

## 6. Pre-Launch Release Gate (P0-1805)

Run the full local validation pipeline before initiating release:
```bash
# 1. Type check
npm run typecheck

# 2. Linter
npm run lint

# 3. Unit, RPC, & Integration Contract Tests
npm test

# 4. Production Next.js Build
npm run build
```
All commands must exit with code `0`.
