/**
 * chat-broadcaster.ts
 *
 * In-process SSE fan-out for job chat messages.
 * One subscriber set per job_id — only the two participants connect.
 *
 * Same pattern as job-broadcaster.ts but scoped to individual jobs.
 * Works perfectly on single-instance Coolify deploy.
 */

type ChatMessage = {
  id: string
  sender_uid: string
  sender_role: string
  body: string
  created_at: string
}

// job_id → set of SSE response controllers
const subscribers = new Map<string, Set<ReadableStreamDefaultController>>()

export function subscribeChatJob(
  jobId: string,
  controller: ReadableStreamDefaultController,
): () => void {
  if (!subscribers.has(jobId)) subscribers.set(jobId, new Set())
  subscribers.get(jobId)!.add(controller)

  // Return cleanup function
  return () => {
    const set = subscribers.get(jobId)
    if (!set) return
    set.delete(controller)
    if (set.size === 0) subscribers.delete(jobId)
  }
}

export function broadcastChat(jobId: string, message: ChatMessage): void {
  const set = subscribers.get(jobId)
  if (!set || set.size === 0) return

  const data = `data: ${JSON.stringify({ type: 'message', message })}\n\n`
  const encoded = new TextEncoder().encode(data)

  for (const controller of set) {
    try {
      controller.enqueue(encoded)
    } catch {
      // Controller closed — will be cleaned up on disconnect
    }
  }
}
