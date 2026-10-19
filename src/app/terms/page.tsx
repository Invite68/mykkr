import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'
import { DIRECT_PAYMENT_METHODS, DISCLAIMER, GST_RATE, PLANS, SITE, formatInr } from '@/config/platform'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  const gst = Math.round(GST_RATE * 100)
  return (
    <LegalPage
      title="Terms of Service"
      effective="1 November 2025"
      summary={
        <>
          <strong>Summary:</strong> {DISCLAIMER} My KKR is not a party to any transaction and takes zero commission.
        </>
      }
      sections={[
        {
          title: 'What My KKR is',
          body: (
            <p>
              My KKR is an online listing and booking connector for Kurukshetra, Haryana. Businesses list goods, services, venues and
              properties; customers discover and contact them; independent drivers accept ride and delivery jobs. My KKR does not provide
              any listed goods or services and is not responsible for their quality, safety or legality.
            </p>
          ),
        },
        {
          title: 'Subscriptions',
          body: (
            <ul>
              <li><strong>Customer plan:</strong> {formatInr(PLANS.customer.priceInr)}/month + {gst}% GST, with a {PLANS.customer.trialDays}-day free trial. Cancel before the trial ends to pay nothing.</li>
              <li><strong>Business plan:</strong> {formatInr(PLANS.business.priceInr)}/month + {gst}% GST, unlimited listings.</li>
              <li><strong>Drivers / partners:</strong> no subscription.</li>
              <li>Subscriptions are billed monthly via Razorpay and auto-renew until cancelled. Used months are non-refundable.</li>
            </ul>
          ),
        },
        {
          title: 'Payments between users',
          body: (
            <p>
              All payments for goods, services, bookings, rides and deliveries go <strong>directly</strong> from the customer to the
              business or driver ({DIRECT_PAYMENT_METHODS.join(', ')}). My KKR does not hold, escrow or refund these payments and takes
              no commission on them.
            </p>
          ),
        },
        {
          title: 'Business listings',
          body: (
            <ul>
              <li>Information must be accurate and kept up to date</li>
              <li>You must be legally allowed to offer what you list</li>
              <li>No illegal, counterfeit, adult or harmful items</li>
              <li>My KKR may remove any listing at any time</li>
            </ul>
          ),
        },
        {
          title: 'Rides & delivery',
          body: (
            <p>
              Drivers are independent partners, not employees of My KKR. My KKR is not a transport company and is not liable for any
              accident, loss, damage or delay.
            </p>
          ),
        },
        {
          title: 'Prohibited conduct',
          body: (
            <ul>
              <li>Posting phone numbers, emails or links in public requirements</li>
              <li>Fake reviews or fake profiles</li>
              <li>Bypassing the subscription</li>
              <li>Harassing other users</li>
            </ul>
          ),
        },
        {
          title: 'Limitation of liability',
          body: (
            <p>
              My KKR is not liable for disputes between users, the quality of goods or services, losses from rides or deliveries, or
              downtime. Our maximum liability is the subscription fee you paid in the preceding month.
            </p>
          ),
        },
        {
          title: 'Governing law',
          body: <p>Indian law applies. Courts in Kurukshetra, Haryana have exclusive jurisdiction.</p>,
        },
        {
          title: 'Contact',
          body: <p><strong>My KKR</strong>, Kurukshetra, Haryana 136118 · {SITE.legalEmail}</p>,
        },
      ]}
    />
  )
}
