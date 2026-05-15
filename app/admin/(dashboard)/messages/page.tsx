import type { Metadata } from 'next'
import { getMessages } from '@/lib/db'
import { MarkReadButton } from '@/components/admin/MarkReadButton'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Messages' }

export default async function AdminMessagesPage() {
  const messages = await getMessages()

  return (
    <>
      <h1 className="font-heading text-4xl mb-12">Messages</h1>

      {messages.length === 0 ? (
        <p className="text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map(message => (
            <div
              key={message.Id}
              className={`border p-6 bg-secondary ${
                message.IsRead ? 'border-border' : 'border-accent'
              }`}
            >
              <div className="flex items-start justify-between mb-3 gap-4">
                <div>
                  <span className="text-foreground">{message.Name}</span>
                  <span className="text-muted-foreground text-sm ml-3">{message.Email}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground">{formatDate(message.CreatedAt)}</span>
                  {message.IsRead ? (
                    <span className="text-xs text-muted-foreground">read</span>
                  ) : (
                    <MarkReadButton id={message.Id} />
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{message.Body}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
