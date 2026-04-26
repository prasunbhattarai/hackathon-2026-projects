"use client";

import { useState, useMemo } from "react";
import { Search, MoreVertical, Power, Eye } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/Components/ui/Badge";
import { Input } from "@/Components/ui/Input";
import { Skeleton } from "@/Components/ui/Skeleton";
import { UserRole, type User } from "@/types/auth.types";
import type { Clinic } from "@/types/admin.types";

export interface UserManagementTableProps {
  users: User[];
  clinics: Clinic[];
  loading: boolean;
  className?: string;
}

const roleBadgeVariant: Record<UserRole, "info" | "success" | "none"> = {
  [UserRole.SUPER_ADMIN]: "info",
  [UserRole.DOCTOR]: "success",
};

const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.DOCTOR]: "Doctor",
};

export const UserManagementTable = ({
  users,
  clinics,
  loading,
  className,
}: UserManagementTableProps) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [clinicFilter, setClinicFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const clinicMap = useMemo(
    () => new Map(clinics.map((c) => [c.id, c.name])),
    [clinics],
  );

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (clinicFilter !== "all") {
      result = result.filter((u) => u.clinicId === clinicFilter);
    }
    return result;
  }, [users, search, roleFilter, clinicFilter]);

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-56">
          <Input
            placeholder="Search by name or email..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-2 text-xs rounded-[4px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
        >
          <option value="all">All Roles</option>
          {(["super_admin", "doctor"] as UserRole[]).map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
        <select
          value={clinicFilter}
          onChange={(e) => setClinicFilter(e.target.value)}
          className="h-9 px-2 text-xs rounded-[4px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
        >
          <option value="all">All Clinics</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {[
                "Name",
                "Email",
                "Role",
                "Clinic",
                "Status",
                "Created",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-3 font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] transition-colors duration-100"
              >
                <td className="py-3 px-3 text-sm font-medium text-[var(--text-primary)]">
                  {user.fullName}
                </td>
                <td className="py-3 px-3 text-xs font-mono text-[var(--text-secondary)]">
                  {user.email}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={roleBadgeVariant[user.role]} size="sm">
                    {roleLabels[user.role]}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-xs text-[var(--text-secondary)]">
                  {user.clinicId
                    ? (clinicMap.get(user.clinicId) ?? "—")
                    : "Platform"}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={user.isActive ? "success" : "none"} size="sm">
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-[11px] font-mono text-[var(--text-muted)]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-3">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === user.id ? null : user.id)
                      }
                      className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === user.id && (
                      <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[4px] shadow-2xl min-w-[140px] animate-fade-in">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer">
                          <Eye size={12} /> View Details
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer">
                          <Power size={12} />{" "}
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          No users match the current filters
        </p>
      )}
    </div>
  );
};
