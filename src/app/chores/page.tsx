import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChoresClient from './ChoresClient'

export default async function ChoresPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the user's profile to know their house and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('house_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.house_id) redirect('/onboarding')

  // Get all chores for this house
  const { data: chores } = await supabase
    .from('chores')
    .select('*')
    .eq('house_id', profile.house_id)
    .order('created_at', { ascending: true })

  return (
    <ChoresClient
      chores={chores || []}
      isAdmin={profile.role === 'admin'}
    />
  )
}