/**
 * Shared types for the jobs system.
 * These match the `jobs` table columns exactly (snake_case from Postgres).
 */

export type JobStatus =
  | 'open'
  | 'accepted'
  | 'driver_en_route'
  | 'picked_up'
  | 'completed'
  | 'cancelled_by_rider'
  | 'cancelled_by_driver'

export type JobMode = 'ride' | 'deliver'

/** Full DB row — matches SELECT * from jobs */
export interface Job {
  id:            string
  ref:           string
  mode:          JobMode
  status:        JobStatus

  customer_name:  string
  customer_phone: string   // AES-256-GCM encrypted

  pickup_label:   string
  pickup_lat:     number
  pickup_lon:     number
  dropoff_label:  string
  dropoff_lat:    number
  dropoff_lon:    number

  vehicle_id:     string
  distance_km:    number  | null
  fare_estimate:  number  | null   // paise
  notes:          string  | null
  scheduled_at:   string  | null   // ISO timestamp

  driver_id:      string  | null
  driver_name:    string  | null
  driver_phone:   string  | null   // AES-256-GCM encrypted
  driver_vehicle: string  | null

  cancel_by:      string  | null
  cancel_reason:  string  | null

  created_at:     string
  accepted_at:    string  | null
  picked_up_at:   string  | null
  completed_at:   string  | null
  cancelled_at:   string  | null
  updated_at:     string
}

/**
 * Safe job — driver_phone and customer_phone are redacted.
 * This is what API responses return to the browser.
 */
export type SafeJob = Omit<Job, 'customer_phone' | 'driver_phone'> & {
  driver_phone: string | null   // only non-null after job is accepted
}

/** Valid transitions a driver can trigger via PATCH /api/jobs/[id]/status */
export const DRIVER_TRANSITIONS: Record<string, JobStatus> = {
  accepted:       'driver_en_route',
  driver_en_route: 'picked_up',
  picked_up:      'completed',
}

/** SSE event shapes pushed to the driver job board */
export type JobEvent =
  | { type: 'job_new';     job: SafeJob }
  | { type: 'job_updated'; job: SafeJob }
  | { type: 'ping' }
