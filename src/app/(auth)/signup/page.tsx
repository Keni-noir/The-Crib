'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6 text-[#0D0B08]" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <main className="w-full max-w-[400px] mx-auto">
        <div className="grid gap-8">
          <header className="grid gap-2">
            <h1 className="m-0 text-[24px] font-medium leading-tight">AJ's Crib</h1>
            <p className="m-0 text-[13px] text-[#8A8478]">Keep the house in order</p>
          </header>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <label htmlFor="name" className="text-xs text-[#8A8478]">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-[40px] min-h-[40px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="email" className="text-xs text-[#8A8478]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-[40px] min-h-[40px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="password" className="text-xs text-[#8A8478]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-[40px] min-h-[40px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]"
              />
            </div>

            {error && <p className="text-xs text-[#c0392b]">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="h-[40px] min-h-[40px] w-full rounded-[5px] bg-[#0D0B08] text-[#FAF9F7] text-sm font-medium transition-opacity duration-150 ease-in-out hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <footer className="text-center">
            <p className="m-0 text-[13px] text-[#8A8478]">
              Already have an account?{' '}
              <a href="/login" className="text-[#0D0B08] underline">Sign in</a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}