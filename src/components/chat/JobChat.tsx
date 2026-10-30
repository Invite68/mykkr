'use client'

/**
 * JobChat — live in-platform chat between customer and driver.
 *
 * Shown on the tracking page when job status is accepted/driver_en_route/picked_up.
 * Connects to SSE stream for real-time messages, POSTs to send.
 *
 * Props:
 *   jobId    — the job ID
 *   myUid    — the current user's Firebase UID
 *   myRole   — 'customer' | 'driver'
 *   idToken  — Firebase ID token for auth headers
 */

import { useState, useEffect, useRef, type FormEvent } from 'react'

interface ChatMessage {
  id: string
  sender_uid: string
  sender_role: string
  body: string
  created_at: string
}

interface Props {
  jobId: string
  myUid: string
  myRole: 'customer' | 'driver'
  idToken: string
}

export default function JobChat({ jobId, myUid, myRole, idToken }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const esRef = useRef<EventSource | null>(null)

  // Connect to SSE stream
  useEffect(() => {
    // EventSource doesn't support custom headers — pass token as query param
    // The server accepts ?token= and treats it as a Bearer token
    const url = `/api/jobs/${jobId}/messages/stream?token=${encodeURIComponent(idToken)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as
          | { type: 'snapshot'; messages: ChatMessage[] }
          | { type: 'message'; message: ChatMessage }

        if (data.type === 'snapshot') {
          setMessages(data.messages)
        } else if (data.type === 'message') {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === data.message.id)) return prev
            return [...prev, data.message]
          })
        }
      } catch { /* ignore parse errors */ }
    }

    es.onerror = () => {
      setConnected(false)
      // EventSource auto-reconnects
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [jobId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e: FormEvent) {
    e.preventDefault()
    const body = input.trim()
    if (!body || sending) return

    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ body }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to send message')
        return
      }
      setInput('')
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setSending(false)
    }
  }

  const otherRole = myRole === 'customer' ? 'driver' : 'customer'
  const otherLabel = myRole === 'customer' ? 'Driver' : 'Customer'

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <span aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span>Chat with {otherLabel}</span>
        <span className={`chat-status ${connected ? 'chat-status-on' : 'chat-status-off'}`}>
          {connected ? 'Live' : 'Connecting…'}
        </span>
      </div>

      {/* Message list */}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <p className="chat-empty muted">No messages yet. Say hello to your {otherLabel.toLowerCase()}.</p>
        )}
        {messages.map((msg) => {
          const mine = msg.sender_uid === myUid
          return (
            <div key={msg.id} className={`chat-bubble ${mine ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>
              {!mine && (
                <span className="chat-role-label">{otherLabel}</span>
              )}
              <span className="chat-body">{msg.body}</span>
              <span className="chat-time">
                {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="chat-error" role="alert">{error}</div>
      )}

      {/* Input */}
      <form className="chat-form" onSubmit={send}>
        <input
          className="chat-input input"
          type="text"
          placeholder={`Message ${otherLabel.toLowerCase()}…`}
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary chat-send-btn"
          disabled={!input.trim() || sending}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>

      <p className="chat-disclaimer muted">
        Messages are stored for 90 days then deleted. Do not share payment details in chat.
      </p>
    </div>
  )
}
