'use client'

import { Sidebar } from '@/Components/Layout/Sidebar'
import { Topbar } from '@/Components/Layout/Topbar'
import { Container } from '@/Components/Layout/Container'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Container className="py-6">{children}</Container>
        </main>
      </div>
    </div>
  )
}
