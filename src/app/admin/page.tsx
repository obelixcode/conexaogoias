import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Always redirect to dashboard - middleware handles auth
  redirect('/admin/dashboard');
}
