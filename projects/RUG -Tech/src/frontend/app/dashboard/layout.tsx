import DashboardLayout from '@/app/(dashboard)/layout'

export default function DashboardSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardLayout>{children}</DashboardLayout>
}

