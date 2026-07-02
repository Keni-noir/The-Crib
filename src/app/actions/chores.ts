'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateAssignments, getWeekStart } from '@/lib/assignment-engine'
import { createNotification } from '@/lib/notifications'

// Check if the current user is an admin
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, house_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Only admins can manage chores')
  }

  return { supabase, profile }
}

export async function createChore(formData: FormData) {
  const { supabase, profile } = await requireAdmin()

  const title = formData.get('title') as string
  const frequency = formData.get('frequency') as string
  const times_per_week = frequency === 'weekly'
    ? parseInt(formData.get('times_per_week') as string) || 1
    : null
  const scope = formData.get('scope') as string
  const room = scope === 'room' ? formData.get('room') as string : null
  const people_required = parseInt(formData.get('people_required') as string) || 1

  const { error } = await supabase
    .from('chores')
    .insert({
      house_id: profile.house_id,
      title,
      frequency,
      times_per_week,
      scope,
      room,
      people_required
    })

  if (error) {
    return { error: 'Failed to create chore. Please try again.' }
  }

  revalidatePath('/chores')
}

export async function deleteChore(choreId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', choreId)

  if (error) {
    return { error: 'Failed to delete chore.' }
  }

  revalidatePath('/chores')
}

export async function generateWeeklyAssignments() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('house_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.house_id) return { error: 'No house found' }

  const weekStart = getWeekStart()

  // Check if assignments already exist for this week
  const { data: existing } = await supabase
    .from('assignments')
    .select('id')
    .eq('house_id', profile.house_id)
    .eq('week_start', weekStart)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'Assignments already exist for this week' }
  }

  // Get all chores for this house
  const { data: chores } = await supabase
    .from('chores')
    .select('*')
    .eq('house_id', profile.house_id)

  // Get all members of this house
  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, room, is_away')
    .eq('house_id', profile.house_id)
  
  if (!chores || !members) return { error: 'Failed to load data' }

  // Generate assignments using the engine
  const assignments = generateAssignments(chores, members, weekStart)

  if (assignments.length === 0) return { error: 'No assignments generated' }

  // Save all assignments to the database
  const { error } = await supabase
    .from('assignments')
    .insert(assignments)

  if (error) return { error: 'Failed to save assignments' }

  revalidatePath('/dashboard')
  revalidatePath('/chores')
}

export async function requestSwap(assignmentId: string, targetId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, house_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  const { data: assignment } = await supabase
    .from('assignments')
    .select('chores(title)')
    .eq('id', assignmentId)
    .single()

  const { error } = await supabase
    .from('swap_requests')
    .insert({
      assignment_id: assignmentId,
      requester_id: user.id,
      target_id: targetId,
      status: 'pending'
    })

  if (error) return { error: 'Failed to send swap request' }

  const choreTitle = assignment?.chores
    ? (Array.isArray(assignment.chores) ? assignment.chores[0]?.title : (assignment.chores as { title: string }).title)
    : 'a chore'

  await createNotification(supabase, {
    houseId: profile.house_id,
    recipientId: targetId,
    type: 'swap_request',
    message: `${profile.name} wants to swap "${choreTitle}" with you`,
  })

  revalidatePath('/dashboard')
}

export async function respondToSwap(
  swapId: string,
  action: 'accepted' | 'rejected',
  assignmentId: string,
  requesterId: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Update the swap request status
  const { error: swapError } = await supabase
    .from('swap_requests')
    .update({ status: action })
    .eq('id', swapId)

  if (swapError) return { error: 'Failed to update swap request' }

  // If accepted, reassign the chore to the requester
  if (action === 'accepted') {
    const { error: assignError } = await supabase
      .from('assignments')
      .update({ assigned_to: requesterId })
      .eq('id', assignmentId)

    if (assignError) return { error: 'Failed to reassign chore' }
  }

  revalidatePath('/dashboard')
}

export async function markComplete(assignmentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: assignment, error } = await supabase
    .from('assignments')
    .update({ status: 'pending_confirmation' })
    .eq('id', assignmentId)
    .eq('assigned_to', user.id)
    .select('house_id, chore_id, chores(title)')
    .single()

  if (error) return { error: 'Failed to update chore status' }

  // Notify the admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('house_id', assignment.house_id)
    .eq('role', 'admin')
    .single()

  const choreTitle = Array.isArray(assignment.chores)
    ? assignment.chores[0]?.title
    : (assignment.chores as { title: string } | null)?.title

  if (admin) {
    await createNotification(supabase, {
      houseId: assignment.house_id,
      recipientId: admin.id,
      type: 'pending_approval',
      message: `${profile?.name ?? 'Someone'} marked "${choreTitle}" as done — needs your approval`,
    })
  }

  revalidatePath('/dashboard')
}

export async function confirmCompletion(assignmentId: string) {
  const { supabase } = await requireAdmin()

  const { data: assignment, error } = await supabase
    .from('assignments')
    .update({
      status: 'completed',
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', assignmentId)
    .select('house_id, assigned_to, chores(title)')
    .single()

  if (error) return { error: 'Failed to confirm completion' }

  const choreTitle = Array.isArray(assignment.chores)
    ? assignment.chores[0]?.title
    : (assignment.chores as { title: string } | null)?.title

  await createNotification(supabase, {
    houseId: assignment.house_id,
    recipientId: assignment.assigned_to,
    type: 'approved',
    message: `"${choreTitle}" was approved ✓`,
  })

  revalidatePath('/dashboard')
}

export async function rejectCompletion(assignmentId: string) {
  const { supabase } = await requireAdmin()

  const { data: assignment, error } = await supabase
    .from('assignments')
    .update({ status: 'incomplete' })
    .eq('id', assignmentId)
    .select('house_id, assigned_to, chores(title)')
    .single()

  if (error) return { error: 'Failed to reject completion' }

  const choreTitle = Array.isArray(assignment.chores)
    ? assignment.chores[0]?.title
    : (assignment.chores as { title: string } | null)?.title

  await createNotification(supabase, {
    houseId: assignment.house_id,
    recipientId: assignment.assigned_to,
    type: 'rejected',
    message: `"${choreTitle}" was rejected — please redo it`,
  })

  revalidatePath('/dashboard')
}