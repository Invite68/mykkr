import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'
import { PLANS, SITE, formatInr } from '@/config/platform'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      effective="1 November 2025"
      summary={
        <>
          <strong>Plain English:</strong> My KKR connects local businesses with customers. We are not a party to any sale, service or delivery. All payments go directly between buyers and sellers. We only charge a small monthly subscription to businesses and customers for using the platform.
        </>
      }
      sections={[
        {
          title: 'What My KKR is',
          body: (
            <p>
              My KKR is an online directory and booking connector for local businesses in Kurukshetra, Haryana. We help businesses get discovered and help customers find, book and contact them. We are <strong>not a shop, agent, seller or service provider</strong> — we are the platform that brings them together.
            </p>
          ),
        },
        {
          title: 'Your account',
          body: (
            <ul>
              <li>You must be 18 or older to create an account.</li>
              <li>You are responsible for keeping your login details safe.</li>
              <li>You must provide accurate information when registering.</li>
              <li>We may suspend or remove accounts that violate these terms.</li>
            </ul>
          ),
        },
        {
          title: 'Subscriptions and payments to My KKR',
          body: (
            <ul>
              <li><strong>Businesses</strong> pay {formatInr(PLANS.business.priceInr)} + GST per month for unlimited listings.</li>
              <li><strong>Customers</strong> pay {formatInr(PLANS.customer.priceInr)} + GST per month after a 7-day free trial.</li>
              <li>Subscriptions renew automatically. You can cancel any time from your account page.</li>
              <li>We do not issue refunds for partial months once a billing period has started.</li>
              <li><strong>My KKR takes zero commission</strong> on any sale, booking or delivery between users.</li>
            </ul>
          ),
        },
        {
          title: 'Payments between users',
          body: (
            <p>
              All payments for goods, services, rides or deliveries are made <strong>directly between the customer and the business</strong> — by UPI, card, wallet or cash as agreed between them. My KKR is not involved in those transactions, does not hold any funds, and takes no cut.
            </p>
          ),
        },
        {
          title: 'No liability for transactions',
          body: (
            <>
              <p>
                My KKR is a connector only. We do not verify the quality of goods or services listed, and we are not responsible for:
              </p>
              <ul>
                <li>Disputes between buyers and sellers</li>
                <li>Refunds, returns or cancellations</li>
                <li>Delivery delays or damage</li>
                <li>Accuracy of business listings</li>
              </ul>
              <p>Any issue with a purchase or booking must be resolved directly between the parties involved.</p>
            </>
          ),
        },
        {
          title: 'Rules for businesses',
          body: (
            <ul>
              <li>List only goods and services you genuinely offer.</li>
              <li>Keep your contact details, prices and availability accurate.</li>
              <li>Do not list anything illegal, harmful or misleading.</li>
              <li>Respond to customer enquiries in good faith.</li>
            </ul>
          ),
        },
        {
          title: 'Rules for customers',
          body: (
            <ul>
              <li>Use the platform to discover and contact local businesses honestly.</li>
              <li>Do not spam businesses or post false reviews.</li>
              <li>Honour bookings you make.</li>
            </ul>
          ),
        },
        {
          title: 'Content you post',
          body: (
            <p>
              By uploading photos, descriptions or reviews, you confirm you own or have the right to use that content, and you allow My KKR to display it on the platform. We may remove content that is false, harmful or reported by others.
            </p>
          ),
        },
        {
          title: 'Changes to these terms',
          body: (
            <p>
              We may update these terms from time to time. If we make significant changes we will notify you by email or through the app. Continuing to use My KKR after an update means you accept the new terms.
            </p>
          ),
        },
        {
          title: 'Governing law',
          body: (
            <p>
              These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Kurukshetra, Haryana.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              Questions about these terms? Reach us on WhatsApp at{' '}
              <a href={SITE.supportWhatsApp} target="_blank" rel="noopener noreferrer">
                {SITE.supportWhatsApp.replace('https://wa.me/', '+').replace('91', '91 ')}
              </a>{' '}
              or email <a href={`mailto:${SITE.legalEmail}`}>{SITE.legalEmail}</a>.
            </p>
          ),
        },
      ]}
    />
  )
}
