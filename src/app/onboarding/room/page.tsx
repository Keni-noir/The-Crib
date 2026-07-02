'use client'

import { useState } from 'react'
import { selectRoom } from '@/app/actions/house'

const ROOMS = [
  { value: 'boys_r1', label: 'Boys Room 1' },
  { value: 'boys_r2', label: 'Boys Room 2' },
  { value: 'ladies', label: 'Ladies Room' },
]

export default function RoomSelectionPage() {
  const [selected, setSelected] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (!selected) {
      setError('Please select a room before continuing.')
      return
    }
    setLoading(true)
    setError('')
    const result = await selectRoom(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <main className="w-full max-w-[400px] mx-auto">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <h1 className="m-0 text-[20px] font-medium text-[#0D0B08]">Which room are you in?</h1>
            <p className="m-0 text-[13px] text-[#8A8478]">
              This is used to assign room-specific chores to the right people.
            </p>
          </div>

          <form action={handleSubmit} className="grid gap-4">
            <div className="grid gap-[10px]">
              {ROOMS.map(room => {
                const active = selected === room.value
                return (
                  <button
                    key={room.value}
                    type="button"
                    onClick={() => setSelected(room.value)}
                    className={`h-[48px] w-full rounded-[5px] border px-4 text-sm font-medium transition duration-150 ease-in-out flex items-center justify-between ${
                      active
                        ? 'border-[#0D0B08] bg-[#0D0B08] text-[#FAF9F7]'
                        : 'border-[#D4CFC6] bg-white text-[#0D0B08] hover:bg-[#F4F1EC]'
                    }`}
                  >
                    <span>{room.label}</span>
                    <span className={`${active ? 'inline-flex' : 'hidden'} h-5 w-5 items-center justify-center rounded-full bg-[#FAF9F7] text-xs text-[#0D0B08]`}>
                      ✓
                    </span>
                  </button>
                )
              })}
            </div>

            <input type="hidden" name="room" value={selected} />

            {error && <p className="text-[13px] text-[#E24B4A]">{error}</p>}

            <button
              type="submit"
              disabled={loading || !selected}
              className={`h-[44px] w-full rounded-[5px] text-sm font-medium transition duration-150 ease-in-out ${
                selected
                  ? 'bg-[#0D0B08] text-[#FAF9F7] hover:opacity-95'
                  : 'bg-[#D4CFC6] text-[#8A8478] cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}