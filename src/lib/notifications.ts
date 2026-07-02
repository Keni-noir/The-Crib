import { SupabaseClient } from '@supabase/supabase-js'

export async function createNotification(
  supabase: SupabaseClient,
  {
    houseId,
    recipientId,
    type,
    message,
  }: {
    houseId: string
    recipientId: string
    type: string
    message: string
  }
) {
  await supabase.from('notifications').insert({
    house_id: houseId,
    recipient_id: recipientId,
    type,
    message,
  })
}