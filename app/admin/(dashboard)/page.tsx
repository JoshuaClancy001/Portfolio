import Link from 'next/link'
import type { Metadata } from 'next'
import { getDashboardStats } from '@/lib/db'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <>
      <h1 className="font-heading text-4xl mb-12">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="border border-border p-6 bg-secondary">
          <div className="font-heading text-4xl text-foreground mb-1">{stats.totalProjects}</div>
          <div className="text-sm text-muted-foreground">total projects</div>
        </div>
        <div className="border border-border p-6 bg-secondary">
          <div className="font-heading text-4xl text-foreground mb-1">{stats.publicProjects}</div>
          <div className="text-sm text-muted-foreground">public</div>
        </div>
        <div className="border border-border p-6 bg-secondary">
          <div
            className={`font-heading text-4xl mb-1 ${
              stats.unreadMessages > 0 ? 'text-accent' : 'text-foreground'
            }`}
          >
            {stats.unreadMessages}
          </div>
          <div className="text-sm text-muted-foreground">unread messages</div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link
          href="/admin/projects"
          className="px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-background transition-colors text-sm"
        >
          manage projects →
        </Link>
        <Link
          href="/admin/messages"
          className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors text-sm"
        >
          view messages →
        </Link>
      </div>
    </>
  )
}
