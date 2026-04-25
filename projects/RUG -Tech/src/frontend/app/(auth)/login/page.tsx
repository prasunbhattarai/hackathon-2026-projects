import type { Metadata } from 'next'
import LoginPageClient from '@/app/(auth)/login/page.client'

export const metadata: Metadata = {
  title: 'Sign In — Fundus AI',
}

export default function LoginPage() {
  return <LoginPageClient />
}
