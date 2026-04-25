'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  LayoutDashboard,
  ScanEye,
  Users,
  ListChecks,
  BookOpen,
  Shield,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/constants/routes'
import { ROLE_PERMISSIONS, type UserRole } from '@/constants/roles'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/Components/ui/Avatar'
import { Badge } from '@/Components/ui/Badge'

/* ---------- Nav Item Definition ---------- */

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  permission?: string
  roles?: UserRole[]
  count?: number
}

interface NavGroup {
  label?: string
  items: NavItem[]
  roles?: UserRole[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: <LayoutDashboard size={16} /> },
      { label: 'Cases', href: ROUTES.CASES, icon: <ScanEye size={16} />, count: 3 },
      { label: 'Patients', href: ROUTES.PATIENTS, icon: <Users size={16} /> },
    ],
  },
  {
    label: 'Clinical',
    items: [
      {
        label: 'Triage Queue',
        href: '/triage',
        icon: <ListChecks size={16} />,
        roles: ['doctor', 'clinic_admin', 'lab_assistant'],
      },
      { label: 'Diseases', href: ROUTES.DISEASES, icon: <BookOpen size={16} /> },
    ],
  },
  {
    label: 'Administration',
    roles: ['super_admin', 'clinic_admin'],
    items: [
      { label: 'Admin Panel', href: ROUTES.ADMIN, icon: <Shield size={16} /> },
      { label: 'Settings', href: ROUTES.SETTINGS, icon: <Settings size={16} /> },
    ],
  },
]

/* ---------- Helpers ---------- */

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function hasPermission(role: UserRole, requiredRoles?: UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true
  const perms = ROLE_PERMISSIONS[role]
  if ((perms as readonly string[]).includes('all')) return true
  return requiredRoles.includes(role)
}

/* ---------- Sidebar ---------- */

export const Sidebar = () => {
  const pathname = usePathname()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const userRole: UserRole = user?.role ?? 'doctor'

  return (
    <motion.aside
      className={cn(
        'h-screen flex flex-col shrink-0',
        'bg-[var(--bg-surface)] border-r border-[var(--border)]',
        'overflow-hidden select-none',
      )}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* ---- Logo ---- */}
      <div className="h-14 px-4 flex items-center gap-3 shrink-0 ">
        <div className="w-8 h-8 rounded-[4px] bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
          <Eye size={18} className="text-[var(--accent)]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              className="font-display text-base text-[var(--text-primary)] whitespace-nowrap"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
            >
              Fundus AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-[var(--border)]" />

      {/* ---- Navigation ---- */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group, gi) => {
          if (group.roles && !hasPermission(userRole, group.roles)) return null

          return (
            <div key={gi} className="mb-2">
              {/* Group label */}
              {group.label && !collapsed && (
                <div className="px-4 py-2">
                  <span className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    {group.label}
                  </span>
                </div>
              )}
              {group.label && collapsed && <div className="mx-3 my-2 h-px bg-[var(--border)]" />}

              {/* Items */}
              {group.items.map((item) => {
                if (item.roles && !hasPermission(userRole, item.roles)) return null

                const active = isActiveRoute(pathname, item.href)

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'mx-2 mb-0.5 h-9 flex items-center gap-2.5 rounded-[4px]',
                        'transition-colors duration-150',
                        collapsed ? 'justify-center px-0' : 'px-3',
                        active
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-l-2 border-[var(--accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>

                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            className="text-sm font-sans flex-1 truncate whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {!collapsed && item.count !== undefined && item.count > 0 && (
                        <Badge variant="critical" size="sm" className="ml-auto">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ---- Collapse Toggle ---- */}
      <div className="px-3 py-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full h-8 flex items-center justify-center rounded-[4px]',
            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-subtle)] transition-all duration-150',
            'cursor-pointer',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft size={16} />
          </motion.span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-[var(--border)]" />

      {/* ---- User Section ---- */}
      <div className={cn('px-3 py-3 shrink-0 flex items-center gap-2.5', collapsed && 'justify-center')}>
        <Avatar name={user?.fullName ?? 'User'} size="sm" role={user?.role} />

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <p className="text-sm font-sans text-[var(--text-primary)] truncate">
                {user?.fullName ?? 'User'}
              </p>
              <p className="text-[10px] font-condensed font-medium text-[var(--text-muted)] uppercase tracking-wide">
                {user?.role?.replace('_', ' ') ?? 'Doctor'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={logout}
            className={cn(
              'p-1.5 rounded-[4px] shrink-0',
              'text-[var(--text-muted)]',
              'hover:text-[var(--sev-critical)] hover:bg-[var(--sev-critical)]/10',
              'transition-colors duration-150 cursor-pointer',
            )}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </motion.aside>
  )
}
