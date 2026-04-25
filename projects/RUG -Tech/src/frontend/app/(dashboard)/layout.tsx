'use client'

import { useState } from 'react'
import { Sidebar } from '@/Components/Layout/Sidebar'
import { Topbar } from '@/Components/Layout/Topbar'
import { MobileSidebar } from '@/Components/Layout/MobileSidebar'
import { MobileTopbar } from '@/Components/Layout/MobileTopbar'
import { Container } from '@/Components/Layout/Container'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop topbar */}
        <div className="hidden md:block">
          <Topbar />
        </div>

        {/* Mobile topbar */}
        <div className="block md:hidden">
          <MobileTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Container className="py-4 md:py-6">{children}</Container>
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  )
}
