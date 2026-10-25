'use client'

import { useSubscription } from '@/components/subscription/SubscriptionProvider'

export default function ContactButton({
  businessName,
  label = 'Contact',
  className = 'btn btn-accent btn-sm',
}: {
  businessName: string
  label?: string
  className?: string
}) {
  const { requestContact } = useSubscription()
  return (
    <button type="button" className={className} onClick={() => requestContact(businessName)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      {label}
    </button>
  )
}
