'use client'

import { useState, type FormEvent } from 'react'
import { AlertTriangle, Eye as EyeIcon, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Input } from '@/Components/ui/Input'
import { Button } from '@/Components/ui/Button'
import { useLogin } from '@/features/auth/hooks/useLogin'

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export const LoginForm = () => {
  const { handleLogin, isLoading, error } = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailError(eErr)
    setPasswordError(pErr)

    if (eErr || pErr) return

    await handleLogin({ email, password })
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[360px] flex flex-col gap-5">
      {/* Header */}
      <div className="mb-2">
        <h1 className="font-display text-[28px] text-[var(--text-primary)] leading-tight">
          Fundus AI
        </h1>
        <p className="font-condensed text-xs text-[var(--text-muted)] uppercase tracking-[0.08em] mt-1">
          Clinical Platform
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div
          className={cn(
            'flex items-start gap-2.5 px-3.5 py-3',
            'bg-[var(--sev-critical)]/10 border border-[var(--sev-critical)]/30',
            'rounded-[4px]',
          )}
          role="alert"
        >
          <AlertTriangle
            size={16}
            className="text-[var(--sev-critical)] shrink-0 mt-0.5"
          />
          <p className="text-sm text-[var(--sev-critical)]">{error}</p>
        </div>
      )}

      {/* Email */}
      <Input
        label="Email Address"
        type="email"
        placeholder="dr.sharma@kistclinic.np"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailError(validateEmail(email))}
        error={emailError ?? undefined}
        autoComplete="email"
        id="login-email"
      />

      {/* Password */}
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setPasswordError(validatePassword(password))}
        error={passwordError ?? undefined}
        autoComplete="current-password"
        id="login-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <EyeIcon size={16} />}
          </button>
        }
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full mt-1"
        id="login-submit"
      >
        Sign In
      </Button>

      {/* Demo hint */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
        For demo:{' '}
        <span className="text-[var(--text-secondary)] font-mono text-[11px]">
          dr.anita@sagarmathaeye.com
        </span>
        {' / '}
        <span className="text-[var(--text-secondary)] font-mono text-[11px]">
          fundus-demo-123
        </span>
      </p>
    </form>
  )
}
