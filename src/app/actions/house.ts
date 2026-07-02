'use server'

import { createClient } from '@/lib/supabase/server'
import { generateInviteCode } from '@/lib/utils/invite'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateAssignments, getWeekStart, getWeekNumber } from '@/lib/assignment-engine'

export async function createHouse(formData: FormData) {
  const supabase = await createClient()

  // Get the currently logged in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const houseName = formData.get('houseName') as string
  const inviteCode = generateInviteCode()

  // Create the house
  const { data: house, error: houseError } = await supabase
    .from('houses')
    .insert({ name: houseName, invite_code: inviteCode })
    .select()
    .single()


  if (houseError || !house) {
    return { error: 'Failed to create house. Please try again.' }
  }

  // Create the profile for this user as admin
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      name: user.user_metadata.name,
      email: user.email!,
      house_id: house.id,
      role: 'admin'
    })

  if (profileError) {
    return { error: 'Failed to create profile. Please try again.' }
  }

  redirect('/onboarding/room')
}

export async function joinHouse(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const inviteCode = (formData.get('inviteCode') as string).toUpperCase().trim()

  // Find the house with this invite code
  const { data: house, error: houseError } = await supabase
    .from('houses')
    .select()
    .eq('invite_code', inviteCode)
    .single()


  if (houseError || !house) {
    return { error: 'Invalid invite code. Please check and try again.' }
  }

  // Create the profile for this user as a member
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      name: user.user_metadata.name,
      email: user.email!,
      house_id: house.id,
      role: 'member'
    })
  if (profileError) {
    return { error: 'Failed to join house. Please try again.' }
  }

  redirect('/onboarding/room')
}

export async function selectRoom(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const room = formData.get('room') as string

  const { error } = await supabase
    .from('profiles')
    .update({ room })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to save your room. Please try again.' }
  }

  redirect('/dashboard')
}

export async function toggleAway(isAway: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({
      is_away: isAway,
      away_since: isAway ? new Date().toISOString() : null
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update away status' }

  revalidatePath('/dashboard')
}

export async function reassignAwayChores(memberId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getWeekStart()

  // Get all incomplete assignments for this member this week
  const { data: memberAssignments } = await supabase
    .from('assignments')
    .select(`
      id,
      chores (id, scope, room, house_id)
    `)
    .eq('assigned_to', memberId)
    .eq('week_start', weekStart)
    .eq('status', 'incomplete')

  if (!memberAssignments || memberAssignments.length === 0) return

  // Get available members (not away, not the member going away)
  const { data: availableMembers } = await supabase
    .from('profiles')
    .select('id, name, room')
    .eq('is_away', false)
    .neq('id', memberId)

  if (!availableMembers || availableMembers.length === 0) return

  // Get current chore counts for available members this week
  const { data: currentAssignments } = await supabase
    .from('assignments')
    .select('assigned_to')
    .eq('week_start', weekStart)
    .neq('assigned_to', memberId)

  // Build a count map of how many chores each member currently has
  const choreCount: Record<string, number> = {}
  availableMembers.forEach(m => { choreCount[m.id] = 0 })
  currentAssignments?.forEach(a => {
    if (choreCount[a.assigned_to] !== undefined) {
      choreCount[a.assigned_to]++
    }
  })

  // Reassign each chore to the member with the fewest chores
  for (const assignment of memberAssignments) {
    const chore = Array.isArray(assignment.chores)
      ? assignment.chores[0]
      : assignment.chores

    if (!chore) continue

    const eligible = chore.scope === 'room'
      ? availableMembers.filter(m => m.room === chore.room)
      : availableMembers

    if (eligible.length === 0) continue

    // Sort by fewest chores first
    const sorted = [...eligible].sort(
      (a, b) => (choreCount[a.id] ?? 0) - (choreCount[b.id] ?? 0)
    )

    const newAssignee = sorted[0]

    await supabase
      .from('assignments')
      .update({ assigned_to: newAssignee.id })
      .eq('id', assignment.id)

    // Update the count so subsequent chores account for this assignment
    choreCount[newAssignee.id] = (choreCount[newAssignee.id] ?? 0) + 1
  }

  revalidatePath('/dashboard')
}

export async function reclaimChores(memberId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getWeekStart()

  // Get the member's profile to know their house and room
  const { data: profile } = await supabase
    .from('profiles')
    .select('house_id, room')
    .eq('id', memberId)
    .single()

  if (!profile) return

  // Get all chores that belong to this house
  const { data: chores } = await supabase
    .from('chores')
    .select('*')
    .eq('house_id', profile.house_id)

  if (!chores) return

  // Get all members of this house (now including the returning member)
  const { data: allMembers } = await supabase
    .from('profiles')
    .select('id, name, room, is_away')
    .eq('house_id', profile.house_id)

  if (!allMembers) return

  // Figure out which chores this member should own based on the rotation
  const weekNumber = getWeekNumber(weekStart)

  // Delete this week's assignments entirely and regenerate
  // This is the cleanest approach — avoids partial state
  await supabase
    .from('assignments')
    .delete()
    .eq('house_id', profile.house_id)
    .eq('week_start', weekStart)

  // Regenerate with the member now back in the pool
  const freshAssignments = generateAssignments(chores, allMembers, weekStart)

  if (freshAssignments.length > 0) {
    await supabase
      .from('assignments')
      .insert(freshAssignments)
  }

  revalidatePath('/dashboard')
}