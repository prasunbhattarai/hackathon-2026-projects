"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  LayoutDashboard,
  ScanEye,
  Users,
  ListChecks,
  BookOpen,
  Shield,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/Components/ui/Avatar";
import type { UserRole } from "@/constants/roles";
import { ROLE_PERMISSIONS } from "@/constants/roles";
import { RoleBadge } from "@/Components/shared/RoleBadge";
import { UserRole as UserRoleEnum } from "@/types/auth.types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={18} />,
  },
  { label: "Cases", href: ROUTES.CASES, icon: <ScanEye size={18} /> },
  { label: "Patients", href: ROUTES.PATIENTS, icon: <Users size={18} /> },
  { label: "Diseases", href: ROUTES.DISEASES, icon: <BookOpen size={18} /> },
  {
    label: "Admin",
    href: ROUTES.ADMIN,
    icon: <Shield size={18} />,
    roles: ["super_admin"],
  },
  { label: "Settings", href: ROUTES.SETTINGS, icon: <Settings size={18} /> },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function hasPermission(role: UserRole, required?: UserRole[]) {
  if (!required || required.length === 0) return true;
  const perms = ROLE_PERMISSIONS[role];
  if ((perms as readonly string[]).includes("all")) return true;
  return required.includes(role);
}

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const userRole: UserRole = user?.role ?? "doctor";

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col"
          >
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[var(--accent)]/15 flex items-center justify-center">
                  <Eye size={18} className="text-[var(--accent)]" />
                </div>
                <span className="font-display text-base text-[var(--text-primary)]">
                  Fundus AI
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-4 h-px bg-[var(--border)]" />

            {/* Nav */}
            <nav className="flex-1 py-3 overflow-y-auto">
              {navItems.map((item) => {
                if (item.roles && !hasPermission(userRole, item.roles))
                  return null;
                const active = isActive(pathname, item.href);

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "mx-2 mb-1 h-11 flex items-center gap-3 rounded-[4px] px-3",
                        "transition-colors duration-150",
                        active
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="mx-4 h-px bg-[var(--border)]" />
            <div className="px-4 py-3 flex items-center gap-3 shrink-0">
              <Avatar
                name={user?.fullName ?? "User"}
                size="sm"
                role={user?.role}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {user?.fullName ?? "User"}
                </p>
                <div className="mt-0.5">
                  <RoleBadge
                    role={(user?.role ?? UserRoleEnum.DOCTOR) as UserRoleEnum}
                    size="sm"
                  />
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--sev-critical)] hover:bg-[var(--sev-critical)]/10 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
