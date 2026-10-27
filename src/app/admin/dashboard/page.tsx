import { redirect } from 'next/navigation'

/**
 * Old dashboard route — redirect to the new admin overview
 */
export default function AdminDashboardRedirect() {
  redirect('/admin')
}
