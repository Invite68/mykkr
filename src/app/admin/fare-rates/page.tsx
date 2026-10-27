import { redirect } from 'next/navigation'

export default function AdminFareRatesRedirect() {
  redirect('/admin/settings')
}
