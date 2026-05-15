import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12 py-16">
      <div className="mb-12">
        <h1 className="font-heading text-4xl md:text-6xl mb-6 tracking-tight">Contact</h1>
        <p className="text-muted-foreground max-w-xl">
          Feel free to reach out, whether it&apos;s about my work, an opportunity, or just to say hello.
        </p>
      </div>
      <a
        href="mailto:joshuajclancy@outlook.com"
        className="text-accent hover:opacity-70 transition-opacity"
      >
        joshuajclancy@outlook.com
      </a>
    </div>
  )
}
