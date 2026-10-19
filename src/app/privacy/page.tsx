import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'
import { PLANS, SITE, formatInr } from '@/config/platform'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effective="1 November 2025"
      sections={[
        {
          title: 'What data we collect',
          body: (
            <ul>
              <li><strong>Customers:</strong> name, mobile number (verified by OTP), optional email, area/locality.</li>
              <li><strong>Businesses:</strong> business and owner name, mobile, email, address, categories, optional GSTIN and photos.</li>
              <li><strong>Delivery drivers / partners:</strong> name, mobile, vehicle details, licence number and the last 4 characters of an Aadhaar or PAN for verification.</li>
              <li><strong>Ride & delivery requests:</strong> name, mobile, pickup and drop-off, vehicle type. Your number is hidden from drivers until one is assigned.</li>
              <li><strong>Automatically:</strong> no tracking cookies, pixels or analytics scripts.</li>
            </ul>
          ),
        },
        {
          title: 'Why we collect it',
          body: (
            <ul>
              <li>To connect customers with local businesses and drivers in Kurukshetra</li>
              <li>To verify identity via OTP</li>
              <li>To run subscriptions ({formatInr(PLANS.customer.priceInr)} or {formatInr(PLANS.business.priceInr)} per month + GST) via Razorpay</li>
              <li>To send booking, order and job notifications</li>
            </ul>
          ),
        },
        {
          title: 'Who we share it with',
          body: (
            <ul>
              <li><strong>Razorpay</strong> — subscription payments (PCI-DSS). We never see card or UPI details.</li>
              <li><strong>Firebase (Google)</strong> — phone OTP authentication.</li>
              <li><strong>OpenStreetMap / Nominatim / OSRM</strong> — maps, address lookup and route estimates. Only the address or coordinates you enter are sent.</li>
              <li><strong>Assigned drivers / businesses</strong> — only what’s needed to complete your order or job.</li>
              <li>We do <strong>not</strong> sell your data.</li>
            </ul>
          ),
        },
        {
          title: 'Data retention',
          body: (
            <ul>
              <li>Account data: while your account is active, plus 3 years after deletion</li>
              <li>Subscription payment records: 7 years (GST / income-tax rules)</li>
              <li>Server logs: 30 days, without personal data</li>
              <li>Ride/delivery locations: deleted 30 days after the job is completed</li>
            </ul>
          ),
        },
        {
          title: 'Your rights (DPDP Act 2023)',
          body: (
            <>
              <p>You can request access to, correction of, or deletion of your personal data, and raise a grievance with our Data Protection Officer.</p>
              <p>Contact <strong>{SITE.privacyEmail}</strong>. We respond within 30 days.</p>
            </>
          ),
        },
        {
          title: 'Security',
          body: (
            <ul>
              <li>HTTPS (TLS 1.2+) everywhere, strict Content-Security-Policy</li>
              <li>Phone numbers encrypted at rest</li>
              <li>Breaches reported to affected users and CERT-In within 6 hours of discovery</li>
            </ul>
          ),
        },
        {
          title: 'Cookies',
          body: <p>My KKR does not use tracking, advertising or analytics cookies, so no cookie banner is needed.</p>,
        },
        {
          title: 'Contact',
          body: (
            <p>
              <strong>My KKR</strong>, Kurukshetra, Haryana 136118, India · {SITE.privacyEmail}
            </p>
          ),
        },
      ]}
    />
  )
}
