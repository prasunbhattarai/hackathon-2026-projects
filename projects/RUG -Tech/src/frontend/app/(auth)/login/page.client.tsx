'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import { pageVariants } from '@/animations/page.variants'
import { LoginForm } from '@/features/auth/components/LoginForm'

const RetinalPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 800 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    {[320, 260, 200, 150, 110, 75, 45].map((r, i) => (
      <ellipse
        key={`e-${i}`}
        cx="400"
        cy="400"
        rx={r}
        ry={r * 0.85}
        stroke="white"
        strokeWidth={i < 2 ? 0.5 : 0.3}
        opacity={0.04 + i * 0.005}
      />
    ))}

    {[
      'M400,400 Q320,340 200,280',
      'M400,400 Q310,370 180,330',
      'M400,400 Q330,420 210,440',
      'M400,400 Q320,460 200,530',
      'M400,400 Q340,480 230,570',
      'M400,400 Q360,350 280,250',
    ].map((d, i) => (
      <path
        key={`t-${i}`}
        d={d}
        stroke="white"
        strokeWidth={1.2 - i * 0.1}
        opacity={0.06 - i * 0.005}
        strokeLinecap="round"
      />
    ))}

    {[
      'M400,400 Q480,340 600,290',
      'M400,400 Q490,380 620,350',
      'M400,400 Q470,420 590,460',
      'M400,400 Q480,470 610,540',
      'M400,400 Q460,350 560,260',
    ].map((d, i) => (
      <path
        key={`n-${i}`}
        d={d}
        stroke="white"
        strokeWidth={1.0 - i * 0.1}
        opacity={0.05 - i * 0.005}
        strokeLinecap="round"
      />
    ))}

    {[
      'M200,280 Q170,260 130,250',
      'M180,330 Q150,310 110,320',
      'M210,440 Q170,450 130,470',
      'M200,530 Q180,560 140,590',
      'M600,290 Q640,270 680,260',
      'M620,350 Q650,340 700,330',
      'M590,460 Q630,470 670,490',
      'M610,540 Q640,560 690,580',
    ].map((d, i) => (
      <path
        key={`c-${i}`}
        d={d}
        stroke="white"
        strokeWidth={0.4}
        opacity={0.04}
        strokeLinecap="round"
      />
    ))}

    <circle cx="310" cy="400" r="40" fill="white" opacity="0.02" />
    <circle cx="310" cy="400" r="20" fill="white" opacity="0.015" />
  </svg>
)

const LeftPanel = () => (
  <div
    className={cn(
      'hidden lg:flex relative w-[60%] overflow-hidden',
      'bg-[var(--bg-base)] items-center justify-center',
    )}
  >
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: 'url(https://picsum.photos/seed/fundus-bg/1200/900)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />

    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 20%, #0A0C0F 75%)',
      }}
    />

    <RetinalPattern />

    <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-xl">
      <div className="w-16 h-16 rounded-[8px] bg-[var(--accent)]/15 flex items-center justify-center mb-8">
        <Eye size={32} className="text-[var(--accent)]" />
      </div>

      <h2 className="font-display italic text-[2.5rem] leading-[1.15] text-[var(--text-primary)] mb-4">
        &ldquo;Precision at the speed of sight.&rdquo;
      </h2>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-sm">
        AI-powered retinal disease detection for clinical excellence.
      </p>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {['DR Detection', 'Glaucoma Risk', 'Heatmap Analysis'].map((label) => (
          <span
            key={label}
            className={cn(
              'px-3 py-1.5 text-xs font-condensed font-medium',
              'bg-[var(--accent)]/10 text-[var(--accent)]',
              'border border-[var(--accent)]/20 rounded-[4px]',
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  </div>
)

const RightPanel = ({ children }: { children: React.ReactNode }) => (
  <div
    className={cn(
      'w-full lg:w-[40%] flex items-center justify-center',
      'bg-[var(--bg-surface)] px-6 py-12 relative',
    )}
  >
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }}
    />
    <div className="relative z-10 w-full flex justify-center">{children}</div>
  </div>
)

export default function LoginPageClient() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <p className="text-sm text-[var(--text-muted)]">Redirecting…</p>
      </div>
    )
  }

  return (
    <motion.div
      className="flex min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <LeftPanel />
      <RightPanel>
        <LoginForm />
      </RightPanel>
    </motion.div>
  )
}

