'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Circle, Monitor } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ProcessingStep {
  label: string
  status: 'pending' | 'active' | 'done'
}

export interface ProcessingViewProps {
  caseId: string | null
  steps: ProcessingStep[]
  isComplete: boolean
  className?: string
}

type ProcessingStatus = 'queued' | 'running' | 'succeeded'

const getProgressFromSteps = (steps: ProcessingStep[], isComplete: boolean) => {
  if (isComplete) return 100
  if (steps.length === 0) return 0

  const doneCount = steps.filter((step) => step.status === 'done').length
  const hasActive = steps.some((step) => step.status === 'active')
  const progressUnits = hasActive ? doneCount + 0.5 : doneCount

  return Math.max(0, Math.min(99, (progressUnits / steps.length) * 100))
}

const getStatusFromSteps = (steps: ProcessingStep[], isComplete: boolean): ProcessingStatus => {
  if (isComplete) return 'succeeded'
  if (steps.some((step) => step.status === 'active')) return 'running'
  return 'queued'
}

const LetterGlitch = ({
  className,
  characters = '. ',
  glitchSpeed = 55,
}: {
  className?: string
  characters?: string
  glitchSpeed?: number
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const frameRef = React.useRef<number | null>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const lastTickRef = React.useRef(0)
  const chars = React.useMemo(() => Array.from(characters), [characters])

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const { width, height } = canvas.getBoundingClientRect()
    const charWidth = 10
    const charHeight = 20
    const cols = Math.ceil(width / charWidth)
    const rows = Math.ceil(height / charHeight)

    ctx.clearRect(0, 0, width, height)
    ctx.font = '16px monospace'
    ctx.textBaseline = 'top'

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = chars[Math.floor(Math.random() * chars.length)] ?? '.'
        const alpha = 0.15 + Math.random() * 0.35
        ctx.fillStyle = `rgba(120, 180, 255, ${alpha.toFixed(3)})`
        ctx.fillText(ch, c * charWidth, r * charHeight)
      }
    }
  }, [chars])

  const resize = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw()
  }, [draw])

  React.useEffect(() => {
    resize()

    const loop = (now: number) => {
      if (now - lastTickRef.current >= glitchSpeed) {
        draw()
        lastTickRef.current = now
      }
      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw, glitchSpeed, resize])

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(0,0,0,0)_58%,_rgba(0,0,0,0.85)_100%)]" />
    </div>
  )
}

const CustomLoader = ({ className }: { className?: string }) => (
  <motion.div
    className={cn('relative h-8 w-8', className)}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
  >
    {[0, 1, 2, 3].map((i) => (
      <motion.span
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className="absolute h-2 w-2 rounded-full bg-[var(--accent)]"
        style={{
          left: i % 2 === 0 ? 0 : 24,
          top: i < 2 ? 0 : 24,
        }}
        animate={{ scale: [1, 0.55, 1] }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          delay: i * 0.15,
          ease: 'easeInOut',
        }}
      />
    ))}
  </motion.div>
)

const AsciiProgressBar = ({
  progress,
  className,
}: {
  progress: number
  className?: string
}) => {
  const totalBars = 22
  const filledBars = Math.floor((progress / 100) * totalBars)

  return (
    <div className={cn('font-mono text-base', className)}>
      <div className="flex items-center text-[var(--text-secondary)]">
        <span className="mr-1 text-[var(--text-muted)]">[</span>
        <div className="flex">
          {Array.from({ length: totalBars }).map((_, index) => {
            const isFilled = index < filledBars
            return (
              <motion.span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1, scale: isFilled ? [1, 1.15, 1] : 1 }}
                transition={{
                  duration: 0.25,
                  delay: isFilled ? index * 0.015 : 0,
                }}
                className={isFilled ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]/50'}
              >
                {isFilled ? '▓' : '░'}
              </motion.span>
            )
          })}
        </div>
        <span className="ml-1 text-[var(--text-muted)]">]</span>
        <span className="ml-2 text-xs text-[var(--text-muted)]">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export const ProcessingView = ({
  caseId,
  steps,
  isComplete,
  className,
}: ProcessingViewProps) => {
  const progress = React.useMemo(() => getProgressFromSteps(steps, isComplete), [steps, isComplete])
  const status = React.useMemo(() => getStatusFromSteps(steps, isComplete), [steps, isComplete])

  const primaryMessage = isComplete ? 'Analysis complete!' : 'AI analysis in progress...'
  const secondaryMessage = isComplete
    ? 'Redirecting to case details...'
    : 'This may take a few moments'

  return (
    <div className={cn('w-full py-6', className)}>
      <div className="w-full overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="truncate text-sm font-medium text-[var(--text-primary)]">
            {caseId ? `Case ${caseId}` : 'Case analysis'}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{Math.round(progress)}%</div>
        </div>

        <div className="relative h-[320px] w-full overflow-hidden bg-[var(--bg-base)]">
          <div className="absolute inset-0 opacity-30">
            <LetterGlitch />
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 72%)',
            }}
          />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
            <div className="mb-4">
              {status === 'running' || status === 'queued' ? (
                <CustomLoader className="drop-shadow-[0_0_10px_color-mix(in_oklab,var(--accent)_45%,transparent)]" />
              ) : (
                <Check size={28} className="mx-auto text-[var(--success)]" />
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`${status}-${isComplete ? 'done' : 'active'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className={cn(
                  'mb-4 text-center text-sm font-medium',
                  isComplete ? 'text-[var(--success)]' : 'text-[var(--text-primary)]',
                )}
              >
                {primaryMessage}
              </motion.p>
            </AnimatePresence>

            <p className="mb-5 text-xs text-[var(--text-muted)]">{secondaryMessage}</p>

            <AsciiProgressBar progress={progress} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 px-4 py-4">
          {steps.map((step, i) => (
            <div key={`${step.label}-${i}`} className="flex items-center gap-3">
              {step.status === 'done' && <Check size={16} className="shrink-0 text-[var(--success)]" />}
              {step.status === 'active' && (
                <Loader2 size={16} className="shrink-0 animate-spin text-[var(--accent)]" />
              )}
              {step.status === 'pending' && (
                <Circle size={16} className="shrink-0 text-[var(--text-muted)]" />
              )}
              <span
                className={cn(
                  'text-sm',
                  step.status === 'done' && 'text-[var(--text-secondary)]',
                  step.status === 'active' && 'font-medium text-[var(--text-primary)]',
                  step.status === 'pending' && 'text-[var(--text-muted)]',
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
