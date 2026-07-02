'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/messages'

type Profile = { id: string; name: string }

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  profiles: Profile
}

type Props = {
  currentUser: { id: string; name: string; house_id: string; role: string }
  initialMessages: Message[]
  houseId: string
}

export default function ChatClient({ currentUser, initialMessages, houseId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to realtime new messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('house-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `house_id=eq.${houseId}`
        },
        async (payload) => {
          // Fetch the sender's profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_id: payload.new.sender_id,
            profiles: profile ?? { id: payload.new.sender_id, name: 'Unknown' }
          }

          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel)
    }
  }, [houseId])

  async function handleSend() {
    if (!input.trim()) return
    setSending(true)
    const content = input
    setInput('') // clear immediately for better UX
    await sendMessage(houseId, content)
    setSending(false)
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await handleSend()
    }
  }

  function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="relative mx-auto h-screen max-w-[680px] overflow-hidden">
        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-10 flex h-12 items-center border-b border-[#D4CFC6] bg-[#FAF9F7] px-6">
          <h1 className="text-[14px] font-medium text-[#0D0B08]">House Chat</h1>
        </header>

        {/* Messages */}
        <main
          className="absolute inset-x-0 top-12 bottom-[112px] overflow-y-auto bg-[#FAF9F7] hide-scrollbar px-6 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {messages.length === 0 ? (
          <p className="text-[13px] text-[#8A8478] text-center py-8">
            No messages yet. Say something!
          </p>
        ) : (
          <div className="space-y-[10px]">
            {messages.map(message => {
              const isMe = message.sender_id === currentUser.id
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-[4px]`}
                >
                  {!isMe && (
                    <span className="text-[10px] text-[#8A8478] px-1">
                      {message.profiles.name}
                    </span>
                  )}
                  <div
                    className={`max-w-[72%] px-3 py-2 text-[13px] ${
                      isMe
                        ? 'bg-[#0D0B08] text-[#FAF9F7] rounded-[14px_14px_3px_14px]'
                        : 'bg-white border-[0.5px] border-[#D4CFC6] text-[#0D0B08] rounded-[14px_14px_14px_3px]'
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className={`text-[10px] text-[#8A8478] px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="absolute inset-x-0 bottom-[56px] border-t border-[#D4CFC6] bg-[#FAF9F7] px-6 py-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 max-h-[96px] w-full resize-none rounded-[20px] border border-[#D4CFC6] bg-white px-4 py-2 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-0 overflow-y-auto"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D0B08] text-[#FAF9F7] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="absolute inset-x-0 bottom-0 border-t border-[#D4CFC6] bg-[#FAF9F7] px-6 py-3">
        <div className="mx-auto flex max-w-[680px] justify-between">
          <a href="/dashboard" className="flex flex-col items-center gap-1 text-[11px] font-medium text-[#0D0B08]">
            <span>Home</span>
          </a>
          <a href="/chores" className="flex flex-col items-center gap-1 text-[11px] font-medium text-[#8A8478]">
            <span>Chores</span>
          </a>
          <a href="/chat" className="flex flex-col items-center gap-1 text-[11px] font-medium text-[#0D0B08]">
            <span>Chat</span>
          </a>
        </div>
      </nav>
    </div>
    </div>
  )
}