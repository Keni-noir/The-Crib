'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

type Props = {
  userId: string
  initialNotifications: Notification[]
}

export default function NotificationBell({ userId, initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function markAllRead() {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) {
      markAllRead()
    }
  }

  function timeAgo(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '5px',
          border: '1px solid #D4CFC6',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0B08" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#E24B4A',
              border: '1.5px solid #FAF9F7',
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: '300px',
            maxHeight: '360px',
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #D4CFC6',
            borderRadius: '5px',
            padding: '8px',
            zIndex: 50,
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#0D0B08', padding: '6px 8px' }}>
            Notifications
          </p>
          {notifications.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#8A8478', padding: '16px 8px', textAlign: 'center' }}>
              No notifications yet
            </p>
          ) : (
            notifications.slice(0, 20).map(n => (
              <div
                key={n.id}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #F2F0EC',
                }}
              >
                <p style={{ fontSize: '12px', color: '#0D0B08', lineHeight: 1.5 }}>
                  {n.message}
                </p>
                <p style={{ fontSize: '10px', color: '#8A8478', marginTop: '2px' }}>
                  {timeAgo(n.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}