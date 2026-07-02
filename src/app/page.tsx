import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ background: '#FAF9F7', minHeight: '100vh', fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#0D0B08' }}>

      {/* Nav */}
      <nav style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '15px', fontWeight: 500 }}>The Crib</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/login" style={{
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '5px',
            border: '1px solid #D4CFC6',
            color: '#0D0B08',
            textDecoration: 'none',
            background: 'transparent',
          }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '5px',
            border: '1px solid #0D0B08',
            color: '#FAF9F7',
            textDecoration: 'none',
            background: '#0D0B08',
          }}>
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 64px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8478', marginBottom: '16px' }}>
          For households that want to run smoothly
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '20px', maxWidth: '560px' }}>
          Keep the house in order — together
        </h1>
        <p style={{ fontSize: '16px', color: '#8A8478', lineHeight: 1.7, maxWidth: '480px', marginBottom: '36px' }}>
          AJ's Crib automatically assigns and rotates chores fairly, keeps everyone accountable, and gives your household one place to coordinate.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '5px',
            background: '#0D0B08',
            color: '#FAF9F7',
            textDecoration: 'none',
          }}>
            Get started free
          </Link>
          <Link href="/login" style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '5px',
            border: '1px solid #D4CFC6',
            color: '#0D0B08',
            textDecoration: 'none',
            background: 'transparent',
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderTop: '1px solid #E8E0D4' }} />
      </div>

      {/* Features */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8478', marginBottom: '40px' }}>
          Features
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              ),
              title: 'Fair rotation',
              desc: 'Chores are automatically assigned and rotated weekly so no one person gets stuck with the same task every time.'
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
              title: 'Room-based assignments',
              desc: 'Members declare their room on signup. Room-specific chores only go to the people who live in that room.'
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              ),
              title: 'Admin confirmation',
              desc: 'Members mark chores as done. Admin verifies before it counts — no self-reporting without accountability.'
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                </svg>
              ),
              title: 'Chore swapping',
              desc: 'Can\'t do your chore today? Request a swap with any other member. They accept or decline — system updates automatically.'
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              ),
              title: 'House chat',
              desc: 'A real-time group chat for the whole house. Announcements, coordination, or just talking — all in one place.'
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
              ),
              title: 'Away mode',
              desc: 'Going out of town? Mark yourself away and your chores are redistributed fairly. Come back and they return to you.'
            },
          ].map((f, i) => (
            <div key={i} style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E8E0D4', borderRadius: '5px' }}>
              <div style={{ color: '#0D0B08', marginBottom: '12px' }}>{f.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>{f.title}</p>
              <p style={{ fontSize: '13px', color: '#8A8478', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderTop: '1px solid #E8E0D4' }} />
      </div>

      {/* How it works */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8478', marginBottom: '40px' }}>
          How it works
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            {
              step: '01',
              title: 'Admin creates the house',
              desc: 'One person sets up the household and gets a unique invite code to share with everyone.'
            },
            {
              step: '02',
              title: 'Members join and pick their room',
              desc: 'Each person joins using the invite code and selects which room their belongings are in.'
            },
            {
              step: '03',
              title: 'Admin defines the chores',
              desc: 'Set up chores with frequency (daily, weekly, monthly), scope (whole house or specific room), and how many people each needs.'
            },
            {
              step: '04',
              title: 'System assigns and rotates automatically',
              desc: 'Every week, chores are distributed fairly across available members. The rotation shifts so nobody gets the same chore twice in a row.'
            },
            {
              step: '05',
              title: 'Members do their chores and mark done',
              desc: 'When a chore is done, the member marks it complete. Admin confirms — it only counts when verified.'
            },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '24px', padding: '24px 0', borderBottom: i < 4 ? '1px solid #E8E0D4' : 'none' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#8A8478', minWidth: '24px', paddingTop: '2px' }}>{s.step}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>{s.title}</p>
                <p style={{ fontSize: '13px', color: '#8A8478', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderTop: '1px solid #E8E0D4' }} />
      </div>

      {/* CTA */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '16px', maxWidth: '420px' }}>
          Ready to sort out the house?
        </h2>
        <p style={{ fontSize: '14px', color: '#8A8478', lineHeight: 1.7, marginBottom: '32px', maxWidth: '400px' }}>
          Create your household in under a minute. Invite your family, set up chores, and let the system handle the rest.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '5px',
            background: '#0D0B08',
            color: '#FAF9F7',
            textDecoration: 'none',
          }}>
            Create your house
          </Link>
          <Link href="/login" style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '5px',
            border: '1px solid #D4CFC6',
            color: '#0D0B08',
            textDecoration: 'none',
            background: 'transparent',
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: '720px', margin: '0 auto', padding: '24px', borderTop: '1px solid #E8E0D4' }}>
        <p style={{ fontSize: '12px', color: '#8A8478' }}>
          AJ's Crib — Keep the house in order
        </p>
      </footer>

    </div>
  )
}