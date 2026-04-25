import type { Metadata } from 'next';
import DashboardPageClient from '@/app/(dashboard)/page.client';

export const metadata: Metadata = {
  title: 'Dashboard — Fundus AI',
};

export default function DashboardPage() {
  return <DashboardPageClient />
}
