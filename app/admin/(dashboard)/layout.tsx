export const dynamic = 'force-dynamic'

import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12">{children}</main>
    </>
  )
}
