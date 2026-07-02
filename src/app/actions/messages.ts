'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function sendMessage(houseId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const trimmed = content.trim()
  if (!trimmed) return { error: 'Message cannot be empty' }

  const { error } = await supabase
    .from('messages')
    .insert({
      house_id: houseId,
      sender_id: user.id,
      content: trimmed
    })

  if (error) return { error: 'Failed to send message' }

  revalidatePath('/chat')
}