"use client";

import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { useCreateRoomType, useDashboardRoomTypes } from "@/hooks/useDashboard";
import type { RoomType } from "@/lib/types/dashboard";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function RoomTypesPage() {
  const { data: roomTypes, isLoading } = useDashboardRoomTypes();
  const createRoomType = useCreateRoomType();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createRoomType.mutateAsync({ name: name.trim() });
    setName("");
    setShowCreate(false);
  };

  const columns: Column<RoomType>[] = [
    {
      key: "name",
      header: "Type Name",
      render: (row) => (
        <span className="font-medium text-[#1a1a1a]">{row.name}</span>
      ),
    },
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.id}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Room Types"
        description="Manage room categories for your hotel."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            Add Type
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={roomTypes ?? []}
        isLoading={isLoading}
        emptyMessage="No room types created yet"
        rowKey={(row) => row.id}
      />

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Room Type"
        description="Add a new room category."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Type Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deluxe Suite"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRoomType.isPending}
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
            >
              {createRoomType.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
