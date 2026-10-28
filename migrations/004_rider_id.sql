-- Migration 004: Add rider_id to jobs table
-- Stores the Firebase UID of the customer who created each job.
-- Used server-side to authorise rider cancellations without trusting client-supplied role.
-- Part of V13 security fix (cancel route role derivation from DB).

-- Safe to run multiple times (IF NOT EXISTS)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS rider_id TEXT;

-- Index for fast lookup when checking cancellation auth
CREATE INDEX IF NOT EXISTS idx_jobs_rider_id ON jobs (rider_id);

-- Note: existing jobs will have rider_id = NULL.
-- New jobs store the Firebase UID of the creator at insert time.
