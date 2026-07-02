import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, house_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.house_id) redirect('/onboarding')

  // Load the last 50 messages on page load
  const { data: initialMessages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      profiles (id, name)
    `)
    .eq('house_id', profile.house_id)
    .order('created_at', { ascending: true })
    .limit(50)

  const messages = (initialMessages || []).map(m => ({
    ...m,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }))

  return (
    <ChatClient
      currentUser={profile}
      initialMessages={messages}
      houseId={profile.house_id}
    />
  )
}