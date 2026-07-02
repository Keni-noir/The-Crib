'use client'

import { useState } from 'react'
import { createChore, deleteChore, generateWeeklyAssignments } from '@/app/actions/chores'


type Chore = {
  id: string
  title: string
  frequency: string
  times_per_week: number | null
  scope: string
  room: string | null
  people_required: number
}

type Props = {
  chores: Chore[]
  isAdmin: boolean
}

const ROOMS = [
  { value: 'boys_r1', label: 'Boys Room 1' },
  { value: 'boys_r2', label: 'Boys Room 2' },
  { value: 'ladies', label: 'Ladies Room' },
]

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export default function ChoresClient({ chores, isAdmin }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [frequency, setFrequency] = useState('weekly')
  const [scope, setScope] = useState('house')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await createChore(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setShowForm(false)
      setFrequency('weekly')
      setScope('house')
    }
    setLoading(false)
  }

  async function handleDelete(choreId: string) {
    if (!confirm('Delete this chore?')) return
    await deleteChore(choreId)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="mx-auto w-full max-w-[680px] px-6 py-0 space-y-6">
        <div className="rounded-[5px] border border-[#D4CFC6] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-[18px] font-medium text-[#0D0B08]">Chores</h1>
            {isAdmin && (
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="h-[34px] rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] font-medium text-[#0D0B08] hover:bg-[#F3F0EC]"
                >
                  + Add chore
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await generateWeeklyAssignments()
                    if (result?.error) alert(result.error)
                    else alert('Assignments generated!')
                  }}
                  className="h-[34px] rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] font-medium text-[#0D0B08] hover:bg-[#F3F0EC]"
                >
                  Generate this week
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Add chore form — admin only */}
      {isAdmin && showForm && (
        <form action={handleCreate} className="space-y-4 rounded-[5px] border border-[#D4CFC6] bg-white p-4">
          <h2 className="text-[13px] font-medium text-[#0D0B08]">New chore</h2>

          <div className="space-y-3">
            <label htmlFor="title" className="text-[12px] font-medium text-[#0D0B08]">
              Chore name
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Sweep living room"
              required
              className="h-10 w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-1 focus:ring-[#0D0B08]/20"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="frequency" className="text-[12px] font-medium text-[#0D0B08]">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="h-10 w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-1 focus:ring-[#0D0B08]/20"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-3">
              <label htmlFor="times_per_week" className="text-[12px] font-medium text-[#0D0B08]">
                Times per week
              </label>
              <select
                id="times_per_week"
                name="times_per_week"
                className="h-10 w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-1 focus:ring-[#0D0B08]/20"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="scope" className="text-[12px] font-medium text-[#0D0B08]">
              Assigned to
            </label>
            <select
              id="scope"
              name="scope"
              value={scope}
              onChange={e => setScope(e.target.value)}
              className="h-10 w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-1 focus:ring-[#0D0B08]/20"
            >
              <option value="house">Whole house</option>
              <option value="room">Specific room</option>
            </select>
          </div>

          {scope === 'room' && (
            <div className="space-y-3">
              <label htmlFor="room" className="text-[12px] font-medium text-[#0D0B08]">
                Which room
              </label>
              <select
                id="room"
                name="room"
                className="h-10 w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-1 focus:ring-[#0D0B08]/20"
              >
                {ROOMS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="people_required" className="text-[12px] font-medium text-[#0D0B08]">
              People required
            </label>
            <select
              id="people_required"
              name="people_required"
              className="h-10 w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[13px] text-[#0D0B08] outline-none focus:border-[#0D0B08] focus:ring-1 focus:ring-[#0D0B08]/20"
            >
              <option value="1">1 person</option>
              <option value="2">2 people</option>
              <option value="3">3 people</option>
            </select>
          </div>

          {error && <p className="text-[13px] text-[#9F1F1F]">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-[34px] rounded-[5px] bg-[#0D0B08] px-4 text-[13px] font-medium text-white transition hover:bg-[#060501] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save chore'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 h-[34px] rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-[13px] font-medium text-[#0D0B08] hover:bg-[#F3F0EC]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {chores.length === 0 ? (
        <p className="text-[13px] text-[#8A8478] text-center py-8">
          No chores yet.{isAdmin ? ' Add one above.' : ' Ask your admin to add chores.'}
        </p>
      ) : (
        <div className="space-y-3">
          {chores.map(chore => (
            <div
              key={chore.id}
              className="rounded-[5px] border border-[#D4CFC6] bg-white p-[14px] flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#0D0B08] truncate">{chore.title}</p>
                <p className="mt-2 text-[11px] text-[#8A8478]">
                  {FREQUENCY_LABELS[chore.frequency]}
                  {chore.frequency === 'weekly' && chore.times_per_week && chore.times_per_week > 1
                    ? ` · ${chore.times_per_week}× per week`
                    : ''}
                  {' · '}
                  {chore.scope === 'room'
                    ? ROOMS.find(r => r.value === chore.room)?.label ?? chore.room
                    : 'Whole house'}
                  {chore.people_required > 1
                    ? ` · ${chore.people_required} people`
                    : ''}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(chore.id)}
                  className="text-[13px] text-[#8A8478] hover:text-[#9F1F1F]"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#D4CFC6] bg-[#FAF9F7]">
        <div className="mx-auto flex max-w-[680px] justify-between px-6 py-3">
          <a href="/dashboard" className="flex flex-col items-center gap-1 text-[#0D0B08] text-[11px] font-medium">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12L12 3l9 9v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" />
            </svg>
            Home
          </a>
          <a href="/chores" className="flex flex-col items-center gap-1 text-[#0D0B08] text-[11px] font-medium">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Chores
          </a>
          <a href="/chat" className="flex flex-col items-center gap-1 text-[#8A8478] text-[11px] font-medium">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Chat
          </a>
        </div>
      </nav>

      <div className="h-20" />
    </div>
  )
}