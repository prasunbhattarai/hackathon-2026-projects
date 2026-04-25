import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center relative overflow-hidden">
      {/* Decorative SVG eye */}
      <svg
        viewBox="0 0 200 200"
        className="absolute opacity-[0.03] w-[500px] h-[500px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <ellipse cx="100" cy="100" rx="90" ry="50" className="text-[var(--text-muted)]" />
        <circle cx="100" cy="100" r="30" className="text-[var(--text-muted)]" />
        <circle cx="100" cy="100" r="12" className="text-[var(--accent)]" fill="currentColor" fillOpacity="0.1" />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <h1
          className="font-display text-[var(--text-muted)] select-none"
          style={{ fontSize: '8rem', lineHeight: 1 }}
        >
          404
        </h1>

        <h2 className="font-display text-xl text-[var(--text-primary)]">
          Page not found
        </h2>

        <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          If you believe this is an error, contact your administrator.
        </p>

        <Link
          href={ROUTES.DASHBOARD}
          className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
