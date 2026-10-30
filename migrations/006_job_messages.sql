-- Migration 006: job_messages
-- In-platform chat between customer and driver, scoped to a single job.
-- Chat is only accessible when job status = accepted/driver_en_route/picked_up.
-- Messages auto-deleted after 90 days (cron or manual cleanup).

CREATE TABLE IF NOT EXISTS job_messages (
  id          BIGSERIAL    PRIMARY KEY,
  job_id      TEXT         NOT NULL,  -- no FK: jobs.id may be non-standard PK type
  sender_uid  TEXT         NOT NULL,                          -- Firebase UID
  sender_role TEXT         NOT NULL CHECK (sender_role IN ('customer', 'driver')),
  body        TEXT         NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Fast lookup: all messages for a job in chronological order
CREATE INDEX IF NOT EXISTS job_messages_job_id_idx ON job_messages (job_id, created_at);

-- Fast lookup: messages newer than a given id (for SSE polling catch-up)
CREATE INDEX IF NOT EXISTS job_messages_id_idx ON job_messages (id);

-- Auto-delete messages older than 90 days (run manually or via pg_cron)
-- Example: DELETE FROM job_messages WHERE created_at < now() - interval '90 days';
