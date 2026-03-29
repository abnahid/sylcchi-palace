"use client";

import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRoom,
  useDashboardRoomTypes,
  useDashboardRooms,
  useDeleteRoom,
  useUpdateRoom,
  useUploadRoomImages,
  useDeleteRoomImage,
  useRoomImages,
} from "@/hooks/useDashboard";
import { useSession } from "@/hooks/useAuth";
import type { PrimaryRoom } from "@/lib/types/dashboard";
import { Edit, ImagePlus, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const ITEMS_PER_PAGE = 6;

export default function RoomsPage() {
  const { data: user } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: roomsData, isLoading } = useDashboardRooms({
    page: String(page),
    limit: String(ITEMS_PER_PAGE),
    ...(search ? { search } : {}),
  });
  const { data: roomTypes } = useDashboardRoomTypes();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const uploadImages = useUploadRoomImages();
  const deleteImage = useDeleteRoomImage();

  const [showCreate, setShowCreate] = useState(false);
  const [editRoom, setEditRoom] = useState<PrimaryRoom | null>(null);
  const [imageRoom, setImageRoom] = useState<PrimaryRoom | null>(null);

  const rooms = roomsData?.data ?? [];
  const meta = roomsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const isAdmin = user?.role === "ADMIN";

  const columns: Column<PrimaryRoom>[] = [
    {
      key: "name",
      header: "Room",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0] ? (
            <Image
              src={row.images[0].imageUrl}
              alt={row.name}
              width={48}
              height={36}
              className="rounded-lg object-cover w-12 h-9"
            />
          ) : (
            <div className="w-12 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
              N/A
            </div>
          )}
          <div>
            <p className="font-medium text-[#1a1a1a]">{row.name}</p>
            <p className="text-xs text-slate-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roomType",
      header: "Type",
      render: (row) => (
        <span className="text-slate-600">{row.roomType?.name ?? "—"}</span>
      ),
    },
    {
      key: "price",
      header: "Price/Night",
      render: (row) => (
        <span className="font-medium text-[#1a1a1a]">
          ${Number(row.price).toLocaleString()}
        </span>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (row) => (
        <span className="text-slate-500">{row.capacity} guests</span>
      ),
    },
    {
      key: "bedType",
      header: "Bed",
      render: (row) => (
        <span className="text-slate-600">{row.bedType}</span>
      ),
    },
    {
      key: "isAvailable",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isAvailable ? "AVAILABLE" : "UNAVAILABLE"} />
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
              setImageRoom(row);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#5802f7] hover:bg-[#f3f0ff] transition-all"
            title="Images"
          >
            <ImagePlus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditRoom(row);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#5802f7] hover:bg-[#f3f0ff] transition-all"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${row.name}"?`))
                  deleteRoom.mutate(row.id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rooms"
        description="Manage hotel rooms, pricing, and availability."
        actions={
          <RoleGuard roles={["ADMIN"]}>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 hover:shadow-[#5802f7]/50 hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} />
              Add Room
            </button>
          </RoleGuard>
        }
      />

      {/* Search + Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
            className="relative flex-1 max-w-sm"
          >
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#5802f7]/50 transition-colors"
            />
          </form>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="text-sm text-slate-500 hover:text-[#5802f7] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={rooms}
          isLoading={isLoading}
          emptyMessage="No rooms found"
          rowKey={(row) => row.id}
          footer={
            meta && totalPages > 1 ? (
              <>
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-[#1a1a1a]">
                    {(meta.page - 1) * meta.limit + 1}-
                    {Math.min(meta.page * meta.limit, meta.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[#1a1a1a]">
                    {meta.total}
                  </span>
                </p>
                <div className="flex gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? "px-3 py-1 rounded-md bg-[#5802f7] text-white text-xs shadow-md shadow-[#5802f7]/20"
                          : "px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors"
                      }
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : undefined
          }
        />
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        roomTypes={roomTypes ?? []}
        onCreate={async (data) => {
          await createRoom.mutateAsync(data);
          setShowCreate(false);
        }}
        isPending={createRoom.isPending}
      />

      {/* Edit Room Modal */}
      {editRoom && (
        <EditRoomModal
          open={!!editRoom}
          onClose={() => setEditRoom(null)}
          room={editRoom}
          roomTypes={roomTypes ?? []}
          onUpdate={async (data) => {
            await updateRoom.mutateAsync({ id: editRoom.id, payload: data });
            setEditRoom(null);
          }}
          isPending={updateRoom.isPending}
        />
      )}

      {/* Images Modal */}
      {imageRoom && (
        <RoomImagesModal
          open={!!imageRoom}
          onClose={() => setImageRoom(null)}
          room={imageRoom}
          onUpload={async (formData) => {
            await uploadImages.mutateAsync({
              roomId: imageRoom.id,
              formData,
            });
          }}
          onDeleteImage={async (imageId) => {
            await deleteImage.mutateAsync({
              roomId: imageRoom.id,
              imageId,
            });
          }}
          isUploading={uploadImages.isPending}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

// ── Modals (same logic, styled to match) ──

function CreateRoomModal({
  open, onClose, roomTypes, onCreate, isPending,
}: {
  open: boolean; onClose: () => void;
  roomTypes: { id: string; name: string }[];
  onCreate: (data: Record<string, unknown>) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({ name: "", description: "", price: "", capacity: "", bedType: "", roomTypeId: "", facilities: "", rules: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      name: form.name, description: form.description,
      price: Number(form.price), capacity: Number(form.capacity),
      bedType: form.bedType, roomTypeId: form.roomTypeId,
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      rules: form.rules.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setForm({ name: "", description: "", price: "", capacity: "", bedType: "", roomTypeId: "", facilities: "", rules: "" });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Room Type</label>
            <select value={form.roomTypeId} onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })} className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-[#5802f7]/50" required>
              <option value="">Select type</option>
              {roomTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Price/Night ($)</label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Capacity</label>
            <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Bed Type</label>
            <Input value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} placeholder="e.g. King, Queen" required />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Description</label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Facilities (comma-separated)</label>
          <Input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="WiFi, AC, Mini Bar" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Rules (comma-separated)</label>
          <Input value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="No smoking, No pets" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 hover:shadow-[#5802f7]/50 transition-all disabled:opacity-50">
            {isPending ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditRoomModal({
  open, onClose, room, roomTypes, onUpdate, isPending,
}: {
  open: boolean; onClose: () => void; room: PrimaryRoom;
  roomTypes: { id: string; name: string }[];
  onUpdate: (data: Record<string, unknown>) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: room.name, description: room.description, price: String(room.price),
    capacity: String(room.capacity), bedType: room.bedType, roomTypeId: room.roomTypeId,
    isAvailable: room.isAvailable, facilities: room.facilities.join(", "), rules: room.rules.join(", "),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({
      name: form.name, description: form.description,
      price: Number(form.price), capacity: Number(form.capacity),
      bedType: form.bedType, roomTypeId: form.roomTypeId,
      isAvailable: form.isAvailable,
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      rules: form.rules.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit: ${room.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Room Type</label>
            <select value={form.roomTypeId} onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })} className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-[#5802f7]/50" required>
              {roomTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Price/Night ($)</label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Capacity</label>
            <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Bed Type</label>
            <Input value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} required />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#5802f7]" />
              Available
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Description</label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Facilities</label>
          <Input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Rules</label>
          <Input value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />
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

function RoomImagesModal({
  open, onClose, room, onUpload, onDeleteImage, isUploading, isAdmin,
}: {
  open: boolean; onClose: () => void; room: PrimaryRoom;
  onUpload: (formData: FormData) => Promise<void>;
  onDeleteImage: (imageId: string) => Promise<void>;
  isUploading: boolean; isAdmin: boolean;
}) {
  const { data: images, isLoading } = useRoomImages(room.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));
    await onUpload(formData);
    e.target.value = "";
  };

  return (
    <Modal open={open} onClose={onClose} title={`Images: ${room.name}`} description="Upload up to 3 images at a time." className="max-w-2xl">
      <div className="space-y-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 transition-all hover:border-[#5802f7] hover:text-[#5802f7] hover:bg-[#f3f0ff]">
          <ImagePlus size={18} />
          {isUploading ? "Uploading..." : "Upload Images"}
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={isUploading} className="hidden" />
        </label>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (<div key={i} className="aspect-video animate-pulse rounded-xl bg-slate-100" />))}
          </div>
        ) : images?.length ? (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative">
                <Image src={img.imageUrl} alt="Room" width={200} height={150} className="aspect-video w-full rounded-xl object-cover" />
                {isAdmin && (
                  <button onClick={() => { if (confirm("Delete?")) onDeleteImage(img.id); }}
                    className="absolute right-1 top-1 hidden rounded-lg bg-rose-500/90 p-1 text-white group-hover:block">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400 py-8">No images uploaded yet.</p>
        )}
      </div>
    </Modal>
  );
}
