import { DIRECT_PAYMENT_METHODS } from '@/config/platform'

const COPY: Record<string, string> = {
  services: 'Pick a provider → choose a date & time slot → agree the price directly. Ask for a quote for bigger jobs.',
  venues: 'Check open dates → contact the venue → pay the venue directly for your booking.',
  shopping: 'Browse → order on WhatsApp or call → pay the shop directly. Choose self-delivery, a partner driver, or pick up yourself.',
  food: 'Browse restaurants and food shops → order on WhatsApp or call → pay directly.',
  transport: 'Set pickup & drop-off → nearby drivers get the request → pay the driver directly.',
  events: 'Browse event vendors → contact directly → pay the vendor directly for your booking.',
  default: 'Browse → contact the business → pay them directly. Zero commission to My KKR.',
}

export default function HowItWorks({ catSlug }: { catSlug?: string }) {
  const copy = (catSlug && COPY[catSlug]) || COPY.default
  return (
    <div className="banner banner-info" style={{ marginTop: 12 }}>
      <span aria-hidden="true">ℹ️</span>
      <div>
        <strong>How it works:</strong> {copy} Payment: {DIRECT_PAYMENT_METHODS.join(' / ')} — zero commission to My KKR.
      </div>
    </div>
  )
}
