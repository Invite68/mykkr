import type { ListingKind } from '@/data/categories'
import { DIRECT_PAYMENT_METHODS } from '@/config/platform'

const COPY: Record<ListingKind, string> = {
  goods: 'Browse → order on WhatsApp or call → pay the shop directly. Choose self-delivery, a partner driver, or pick up yourself.',
  service: 'Pick a provider → choose a date & time slot → agree the price directly. Ask for a quote for bigger jobs.',
  venue: 'Check open dates → contact the venue → pay the venue directly for your booking.',
  ride: 'Set pickup & drop-off → nearby drivers get the request → pay the driver directly.',
  property: 'Shortlist a space → contact the owner/agent → all agreements are directly between you.',
}

export default function HowItWorks({ kind }: { kind: ListingKind }) {
  return (
    <div className="banner banner-info" style={{ marginTop: 12 }}>
      <span aria-hidden="true">ℹ️</span>
      <div>
        <strong>How it works:</strong> {COPY[kind]} Payment: {DIRECT_PAYMENT_METHODS.join(' / ')} — zero commission to My KKR.
      </div>
    </div>
  )
}
