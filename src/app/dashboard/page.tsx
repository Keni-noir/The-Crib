import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeekStart } from '@/lib/assignment-engine'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
  .from('profiles')
  .select('id, name, house_id, role, room, is_away')
  .eq('id', user.id)
  .single()

  if (!profile?.house_id) redirect('/onboarding')

  const weekStart = getWeekStart()

  const { data: rawAssignments, error } = await supabase
  .from('assignments')
  .select(`
  id,
  completed,
  completed_at,
  status,
  week_start,
  assigned_to,
  chores (
    id,
    title,
    frequency,
    scope,
    room
  ),
  profiles!assignments_assigned_to_fkey (
    id,
    name,
    room
  )
`)
  .eq('house_id', profile.house_id)
  .eq('week_start', weekStart)

  console.log("Week start:", weekStart)
  console.log("Assignments:", rawAssignments)
  console.log("Error:", error)

  const assignments = (rawAssignments || []).map(a => ({
  ...a,
  chores: Array.isArray(a.chores) ? a.chores[0] : a.chores,
  profiles: Array.isArray(a.profiles) ? a.profiles[0] : a.profiles,
}))

  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, room')
    .eq('house_id', profile.house_id)

  const { data: rawSwapRequests } = await supabase
    .from('swap_requests')
    .select(`
      id,
      status,
      assignment_id,
      requester_id,
      target_id,
      profiles!swap_requests_requester_id_fkey (name)
    `)
    .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
    .eq('status', 'pending')

  const swapRequests = (rawSwapRequests || []).map(s => ({
    ...s,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles,
  }))

  const { data: house } = await supabase
    .from('houses')
    .select('name, invite_code')
    .eq('id', profile.house_id)
    .single()

  const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('recipient_id', user.id)
  .order('created_at', { ascending: false })
  .limit(20)

  return (
    <DashboardClient
      currentUser={profile}
      assignments={assignments}
      members={members || []}
      swapRequests={swapRequests}
      house={house}
      weekStart={weekStart}
      notifications={notifications || []}
    />
  )
}