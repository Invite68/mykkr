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
      🔒 {label}
    </button>
  )
}
