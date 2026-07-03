'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [focused, setFocused] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    handleLogin()
  }

  const colors = {
    page: '#FAF9F7',
    primary: '#0D0B08',
    text: '#0D0B08',
    muted: '#8A8478',
    border: '#D4CFC6',
    surface: '#FFFFFF',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6 text-[#0D0B08]" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <main className="w-full max-w-[400px] mx-auto">
        <div className="grid gap-8">
          <header className="grid gap-2">
            <h1 className="m-0 text-[24px] font-medium leading-tight">The Crib</h1>
            <p className="m-0 text-xs text-[#8A8478]">Keep the house in order</p>
          </header>

          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-3">
              <label htmlFor="email" className="text-xs text-[#8A8478]">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 min-h-[44px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]/20"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="password" className="text-xs text-[#8A8478]">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-11 min-h-[44px] w-full rounded-[5px] border border-[#D4CFC6] bg-white px-4 text-sm text-[#0D0B08] outline-none transition-all duration-150 ease-in-out focus:border-[#0D0B08] focus:ring-2 focus:ring-[#0D0B08]/20"
              />
            </div>

            {error && <p className="m-0 text-xs text-[#c0392b]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-11 min-h-[44px] w-full rounded-[5px] bg-[#0D0B08] text-[#FAF9F7] text-sm font-medium transition-opacity duration-150 ease-in-out hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <footer className="text-center">
            <p className="m-0 text-xs text-[#8A8478]">
              No account?{' '}
              <a href="/signup" className="text-[#0D0B08] underline">Sign up</a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}