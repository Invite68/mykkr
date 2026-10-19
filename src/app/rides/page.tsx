import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import RideRequestForm from '@/components/rides/RideRequestForm'

export const metadata: Metadata = { title: 'Rides & Delivery' }

export default function RidesPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Rides & Delivery' }]} />
      <h1 className="page-title">Go anywhere. Deliver anything.</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>
        Your request goes to verified local drivers. Pay them directly — My KKR takes ₹0 commission.
      </p>

      <div className="split">
        <RideRequestForm />
        <aside className="form-grid">
          <div className="panel">
            <h2 className="panel-title">🔒 Your privacy</h2>
            <ul className="prose">
              <li>Name shown only after a driver accepts</li>
              <li>Phone hidden until a driver is assigned</li>
              <li>Drivers see pickup area &amp; job type only</li>
            </ul>
          </div>
          <div className="panel">
            <h2 className="panel-title">⚡ How it works</h2>
            <ol className="prose" style={{ paddingLeft: 18 }}>
              <li>Fill in the form and submit</li>
              <li>Nearby drivers are notified</li>
              <li>First driver to accept gets the job</li>
              <li>Driver: picked up → delivered (photo proof)</li>
              <li>Pay the driver directly — cash or UPI</li>
            </ol>
          </div>
          <div className="panel" style={{ background: 'var(--night-l)' }}>
            <h2 className="panel-title">🏍️ Are you a driver?</h2>
            <p className="muted" style={{ marginBottom: 12 }}>Join the My KKR partner network and receive delivery &amp; ride jobs.</p>
            <Link href="/register?role=driver" className="btn btn-primary btn-block">Register as a driver →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
