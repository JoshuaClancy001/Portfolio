import { Nav } from '@/components/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Josh Clancy</span>
          <a
            href="https://github.com/JoshuaClancy001"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </>
  )
}
