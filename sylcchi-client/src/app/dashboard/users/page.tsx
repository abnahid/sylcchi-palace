"use client";

import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  useAdminUsers,
  useDeleteUser,
  useUpdateUser,
} from "@/hooks/useDashboard";
import type { UserProfile } from "@/lib/types/dashboard";
import { format } from "date-fns";
import { Edit, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function UsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserProfile | null>(null);

  const filtered =
    users?.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await deleteUser.mutateAsync(id);
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => {
        const initials = row.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() ?? "U";
        const colors = [
          "bg-blue-100 text-blue-600",
          "bg-purple-100 text-purple-600",
          "bg-rose-100 text-rose-600",
          "bg-teal-100 text-teal-600",
          "bg-orange-100 text-orange-600",
        ];
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors[row.name.charCodeAt(0) % colors.length]}`}
            >
              {initials}
            </div>
            <div>
              <p className="font-medium text-[#1a1a1a]">{row.name}</p>
              <p className="text-xs text-slate-400">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <StatusBadge status={row.role} />,
    },
    {
      key: "emailVerified",
      header: "Verified",
      render: (row) => (
        <span
          className={
            row.emailVerified
              ? "text-emerald-600 font-medium"
              : "text-slate-400"
          }
        >
          {row.emailVerified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <span className="text-slate-500">{row.phone ?? "—"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => (
        <span className="text-slate-500">
          {format(new Date(row.createdAt), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditUser(row);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#5802f7] hover:bg-[#f3f0ff] transition-all"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id, row.name);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Manage user accounts and roles." />

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#5802f7]/50 transition-colors"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage="No users found"
          rowKey={(row) => row.id}
        />
      </div>

      {editUser && (
        <EditUserModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          user={editUser}
          onUpdate={async (payload) => {
            await updateUser.mutateAsync({ id: editUser.id, payload });
            setEditUser(null);
          }}
          isPending={updateUser.isPending}
        />
      )}
    </div>
  );
}

function EditUserModal({
  open, onClose, user, onUpdate, isPending,
}: {
  open: boolean; onClose: () => void; user: UserProfile;
  onUpdate: (payload: { name?: string; role?: "CUSTOMER" | "MANAGER" | "ADMIN"; phone?: string }) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: user.name,
    role: user.role as "CUSTOMER" | "MANAGER" | "ADMIN",
    phone: user.phone ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ name: form.name, role: form.role, phone: form.phone || undefined });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit: ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "CUSTOMER" | "MANAGER" | "ADMIN" })} className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-[#5802f7]/50">
            <option value="CUSTOMER">Customer</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Phone</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 transition-all disabled:opacity-50">
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
