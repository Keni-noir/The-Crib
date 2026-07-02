'use client'

import { useState } from 'react'
import { createHouse, joinHouse } from '@/app/actions/house'

export default function OnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await createHouse(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleJoin(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await joinHouse(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
        <main className="w-full max-w-[400px] mx-auto">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <h1 className="m-0 text-[20px] font-medium text-[#0D0B08]">Set up your house</h1>
              <p className="m-0 text-[13px] text-[#8A8478]">Create a new house or join an existing one</p>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => setMode('create')}
                className="h-[44px] w-full rounded-[5px] bg-[#0D0B08] text-sm font-medium text-[#FAF9F7] transition-opacity duration-150 ease-in-out hover:opacity-95"
              >
                Create a house
              </button>
              <button
                onClick={() => setMode('join')}
                className="h-[44px] w-full rounded-[5px] border border-[#D4CFC6] bg-transparent text-sm font-medium text-[#0D0B08] transition-colors duration-150 ease-in-out hover:bg-[#F4F1EC]"
              >
                Join with invite code
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
        <main className="w-full max-w-[400px] mx-auto">
          <div className="grid gap-5">
            <button
              onClick={() => setMode('choose')}
              className="self-start text-[13px] text-[#8A8478]"
            >
              ← Back
            </button>

            <div className="grid gap-2">
              <h1 className="m-0 text-[20px] font-medium text-[#0D0B08]">Create your house</h1>
              <p className="m-0 text-[13px] text-[#8A8478]">You'll get an invite code to share with family members</p>
            </div>

            <form action={handleCreate} className="grid gap-4">
              <div className="grid gap-3">
                <label htmlFor="houseName" className="text-[13px] text-[#8A8478]">House name</label>
                <input
                  id="houseName"
                  name="houseName"
                  type="text"
                  placeholder="e.g. The Johnsons"
                  required
                  className="h-[40px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]"
                />
              </div>

              {error && <p className="text-[13px] text-[#E24B4A]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="h-[44px] w-full rounded-[5px] bg-[#0D0B08] text-sm font-medium text-[#FAF9F7] transition-opacity duration-150 ease-in-out hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create house'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <main className="w-full max-w-[400px] mx-auto">
        <div className="grid gap-5">
          <button
            onClick={() => setMode('choose')}
            className="self-start text-[13px] text-[#8A8478]"
          >
            ← Back
          </button>

          <div className="grid gap-2">
            <h1 className="m-0 text-[20px] font-medium text-[#0D0B08]">Join a house</h1>
            <p className="m-0 text-[13px] text-[#8A8478]">Enter the invite code your admin shared</p>
          </div>

          <form action={handleJoin} className="grid gap-4">
            <div className="grid gap-3">
              <label htmlFor="inviteCode" className="text-[13px] text-[#8A8478]">Invite code</label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                placeholder="e.g. X7KP2M"
                required
                className="h-[40px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]"
              />
            </div>

            {error && <p className="text-[13px] text-[#E24B4A]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-[44px] w-full rounded-[5px] bg-[#0D0B08] text-sm font-medium text-[#FAF9F7] transition-opacity duration-150 ease-in-out hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join house'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}