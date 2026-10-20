/**
 * In-memory SSE broadcaster for the driver job board.
 *
 * When a job is created or updated, call broadcast(event).
 * All connected /api/jobs/stream clients receive it instantly.
 *
 * This lives in the Node.js process memory — it works perfectly for a
 * single-instance deployment (Coolify on one VPS). If you ever scale to
 * multiple instances, replace this with a Redis pub/sub channel.
 *
 * SERVER-SIDE ONLY — never import in Client Components.
 */

import type { JobEvent } from './job-types'

// Each subscriber is a function that writes to its SSE response stream
type Subscriber = (event: JobEvent) => void

// Use a global so it survives Next.js hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __jobSubscribers: Set<Subscriber> | undefined
}

const subscribers: Set<Subscriber> =
  globalThis.__jobSubscribers ?? new Set()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__jobSubscribers = subscribers
}

/** Register a new SSE client. Returns an unsubscribe function. */
export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}

/** Push a job event to all connected driver clients. */
export function broadcast(event: JobEvent): void {
  for (const fn of subscribers) {
    try { fn(event) } catch { /* client disconnected mid-send */ }
  }
}

/** How many drivers are currently watching the board */
export function subscriberCount(): number {
  return subscribers.size
}
