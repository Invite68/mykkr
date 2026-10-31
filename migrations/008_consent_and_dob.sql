-- ── Migration 008: Consent audit trail + date of birth ───────────────────────
--
-- Legal basis (India IT Act 2000 §43A, Consumer Protection Act 2019 §2(7),
-- PDPB / DPDPA 2023 s.6 — informed consent with audit trail):
--
--  • terms_accepted_at  — server-side timestamp of explicit T&C acceptance.
--                         Never trusts the client; set by the API on first write.
--  • terms_version      — identifies which version of T&C was accepted.
--                         Bump this string whenever T&C text changes.
--  • terms_ip           — IPv4/IPv6 of the request that submitted consent.
--                         Required for legal enforcement / dispute resolution.
--  • date_of_birth      — stored on all three profile tables.
--                         Used to enforce 18+ requirement at registration.
--                         Stored as DATE (not TEXT) so we can compute age.
--
-- This data must be retained for the life of the account plus any applicable
-- statutory retention period (minimum 3 years recommended for Indian law).
-- It must NEVER be deleted or overwritten after first set.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── users table: consent columns ─────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,      -- set once, never updated
  ADD COLUMN IF NOT EXISTS terms_version     TEXT,             -- e.g. "v1.0 2024-01-01"
  ADD COLUMN IF NOT EXISTS terms_ip          TEXT;             -- requestor IP at consent time

-- Partial index for admin queries: "show me all users who have not yet accepted terms"
CREATE INDEX IF NOT EXISTS users_terms_accepted_idx
  ON users (terms_accepted_at)
  WHERE terms_accepted_at IS NULL;

-- ── business_profiles: date of birth ─────────────────────────────────────────
-- Stored for the owner/operator, not the business entity itself.

ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS owner_dob DATE;   -- YYYY-MM-DD, must be 18+ at registration

-- ── customer_profiles: date of birth ─────────────────────────────────────────

ALTER TABLE customer_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;   -- YYYY-MM-DD, must be 18+ at registration

-- ── driver_profiles: date of birth ───────────────────────────────────────────
-- Drivers are independently regulated; DOB also used for licence age verification.

ALTER TABLE driver_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;   -- YYYY-MM-DD, must be 18+ at registration

-- ── Enforce: terms must be accepted before account can be used ────────────────
-- (Soft-enforce via application logic; hard constraint left flexible for now
--  so legacy / admin-created accounts are not broken.)
-- A CHECK constraint can be added later once all existing rows are backfilled:
--   ALTER TABLE users ADD CONSTRAINT users_terms_required
--     CHECK (terms_accepted_at IS NOT NULL);
