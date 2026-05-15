'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Nav() {
  const pathname = usePathname()

  const linkClass = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname?.startsWith(href)
    return `text-sm tracking-wide transition-colors ${
      active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
    }`
  }

  return (
    <nav className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-lg opacity-50 hover:opacity-100 transition-opacity">
            JC
          </Link>
          <div className="flex gap-8">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/projects" className={linkClass('/projects')}>Projects</Link>
            <Link href="/roadmap" className={linkClass('/roadmap')}>Roadmap</Link>
            <Link href="/contact" className={linkClass('/contact')}>Contact</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
