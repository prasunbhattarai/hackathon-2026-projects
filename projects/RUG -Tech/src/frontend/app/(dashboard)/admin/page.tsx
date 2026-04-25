import type { Metadata } from 'next'
import AdminPageClient from '@/app/(dashboard)/admin/page.client'

export const metadata: Metadata = {
  title: 'Admin Panel — Fundus AI',
}

export default function AdminPage() {
  return <AdminPageClient />
}
