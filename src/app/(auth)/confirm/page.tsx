export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-6" style={{ fontFamily: "Geist, -apple-system, sans-serif" }}>
      <div className="w-full max-w-[380px]">

        <div className="w-10 h-10 bg-[#F2F0EC] rounded-full flex items-center justify-center mb-6">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0D0B08"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="text-[20px] font-medium text-[#0D0B08] mb-2">
          Check your email
        </h1>

        <p className="text-[13px] text-[#8A8478] leading-relaxed mb-8">
          We sent you a confirmation link. Click it to verify your account
          and then come back to sign in.
        </p>

        <a
          href="/login"
          className="block w-full py-2.5 text-center text-[13px] font-medium rounded-[5px] border border-[#D4CFC6] text-[#0D0B08] no-underline hover:bg-[#F2F0EC] transition-colors"
        >
          Back to sign in
        </a>

      </div>
    </div>
  )
}