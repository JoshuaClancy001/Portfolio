'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <nav className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="font-heading text-lg text-accent">admin</span>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            dashboard
          </Link>
          <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            projects
          </Link>
          <Link href="/admin/messages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            messages
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          logout
        </button>
      </div>
    </nav>
  )
}
