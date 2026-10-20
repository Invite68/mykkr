/**
 * Hand-written Supabase types for the jobs table.
 * Replace with auto-generated types once your project is live:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase-types.ts
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

export interface Job {
  id: string
  ref: string
  mode: JobMode
  status: JobStatus

  customer_name: string
  customer_phone: string

  pickup_label: string
  pickup_lat: number
  pickup_lon: number
  dropoff_label: string
  dropoff_lat: number
  dropoff_lon: number

  vehicle_id: string
  distance_km: number | null
  fare_estimate: number | null
  notes: string | null
  scheduled_at: string | null

  driver_id: string | null
  driver_name: string | null
  driver_phone: string | null
  driver_vehicle: string | null

  cancel_reason: string | null
  cancel_by: string | null

  created_at: string
  accepted_at: string | null
  picked_up_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  updated_at: string
}

type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

// Matches the exact shape @supabase/supabase-js v2 expects
export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job
        Insert: JobInsert
        Update: Partial<JobInsert>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_job: {
        Args: {
          p_job_id: string
          p_driver_id: string
          p_driver_name: string
          p_driver_phone: string
          p_driver_vehicle: string
        }
        Returns: Job
      }
      cancel_job: {
        Args: {
          p_job_id: string
          p_by: string
          p_reason?: string
        }
        Returns: Job
      }
    }
    Enums: {
      job_status: JobStatus
      job_mode: JobMode
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
