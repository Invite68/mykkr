import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'
import { SITE } from '@/config/platform'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effective="1 November 2025"
      summary={
        <>
          <strong>Plain English:</strong> We collect only what we need to run the platform. We never sell your data. You can ask us to delete your account and data at any time.
        </>
      }
      sections={[
        {
          title: 'What we collect',
          body: (
            <ul>
              <li><strong>Customers:</strong> name, mobile number (OTP-verified), optional email and locality.</li>
              <li><strong>Businesses:</strong> business name, owner name, mobile, email, address, categories, optional GSTIN and photos.</li>
              <li><strong>Drivers:</strong> name, mobile, vehicle details and a government ID number for verification.</li>
              <li><strong>Usage:</strong> which pages you visit and searches you make, so we can improve the app.</li>
            </ul>
          ),
        },
        {
          title: 'How we use it',
          body: (
            <ul>
              <li>To show your profile or listings to other users.</li>
              <li>To send you booking confirmations and important account notices.</li>
              <li>To verify your identity and prevent fraud.</li>
              <li>To improve the platform based on how people use it.</li>
            </ul>
          ),
        },
        {
          title: 'Who we share it with',
          body: (
            <>
              <p>We do <strong>not sell</strong> your personal data to anyone.</p>
              <p>We share limited data only when necessary:</p>
              <ul>
                <li>Your name and contact details are visible to the business or customer you book with.</li>
                <li>Payment processing is handled by our payment provider — we do not store card numbers.</li>
                <li>We may share data if required by Indian law or a court order.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Cookies',
          body: (
            <p>
              We use cookies only to keep you logged in and remember your preferences. We do not use advertising cookies or tracking cookies from third parties.
            </p>
          ),
        },
        {
          title: 'Your rights',
          body: (
            <ul>
              <li><strong>Access:</strong> You can view your account details at any time in the app.</li>
              <li><strong>Correction:</strong> You can update your details from your profile page.</li>
              <li><strong>Deletion:</strong> You can delete your account by contacting us. We will remove your personal data within 30 days.</li>
              <li><strong>Opt-out:</strong> You can turn off marketing messages from your account settings.</li>
            </ul>
          ),
        },
        {
          title: 'Data security',
          body: (
            <p>
              We take reasonable steps to protect your information. Sensitive details like phone numbers are stored in encrypted form. No system is 100% secure, so please keep your login details safe.
            </p>
          ),
        },
        {
          title: 'How long we keep data',
          body: (
            <p>
              We keep your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days except where we are required by law to keep it longer (for example, transaction records for tax purposes).
            </p>
          ),
        },
        {
          title: 'Changes to this policy',
          body: (
            <p>
              If we make significant changes to this policy, we will notify you through the app or by email before the changes take effect.
            </p>
          ),
        },
        {
          title: 'Contact',
          body: (
            <p>
              For any privacy questions or a data deletion request, contact us on WhatsApp at{' '}
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
