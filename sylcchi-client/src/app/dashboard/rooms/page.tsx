"use client";

import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuth";
import {
  dashboardKeys,
  useCreateRoom,
  useDashboardRoomTypes,
  useDashboardRooms,
  useDeleteRoom,
  useDeleteRoomImage,
  useRoomImages,
  useUpdateRoom,
  useUploadRoomImages,
} from "@/hooks/useDashboard";
import { useQueryClient } from "@tanstack/react-query";
import type { PrimaryRoom } from "@/lib/types/dashboard";
import {
  CheckCircle,
  Edit,
  ImagePlus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const ITEMS_PER_PAGE = 6;

export default function RoomsPage() {
  const { data: user } = useSession();
  const queryClient = useQueryClient();
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
      render: (row) => <span className="text-slate-600">{row.bedType}</span>,
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-[#f3f0ff] transition-all"
            title="Images"
          >
            <ImagePlus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditRoom(row);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-[#f3f0ff] transition-all"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${row.name}"?`)) deleteRoom.mutate(row.id);
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
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
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 transition-colors"
            />
          </form>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="text-sm text-slate-500 hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: dashboardKeys.rooms(),
              })
            }
            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-[#f3f0ff] transition-all"
            title="Refresh rooms"
          >
            <RefreshCw size={16} />
          </button>
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
                    className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-primary hover:text-primary text-xs transition-colors disabled:opacity-40"
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
                          ? "px-3 py-1 rounded-md bg-primary text-white text-xs shadow-md shadow-primary/20"
                          : "px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-primary hover:text-primary text-xs transition-colors"
                      }
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-primary hover:text-primary text-xs transition-colors disabled:opacity-40"
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
  open,
  onClose,
  roomTypes,
  onCreate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  roomTypes: { id: string; name: string }[];
  onCreate: (data: Record<string, unknown>) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    capacity: "",
    bedType: "",
    roomTypeId: "",
    facilities: "",
    rules: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      capacity: Number(form.capacity),
      bedType: form.bedType,
      roomTypeId: form.roomTypeId,
      facilities: form.facilities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rules: form.rules
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setForm({
      name: "",
      description: "",
      price: "",
      capacity: "",
      bedType: "",
      roomTypeId: "",
      facilities: "",
      rules: "",
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Room Type
            </label>
            <select
              value={form.roomTypeId}
              onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-primary/50"
              required
            >
              <option value="">Select type</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Price/Night ($)
            </label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Capacity
            </label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Bed Type
            </label>
            <Input
              value={form.bedType}
              onChange={(e) => setForm({ ...form, bedType: e.target.value })}
              placeholder="e.g. King, Queen"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
            Description
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
            Facilities (comma-separated)
          </label>
          <Input
            value={form.facilities}
            onChange={(e) => setForm({ ...form, facilities: e.target.value })}
            placeholder="WiFi, AC, Mini Bar"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
            Rules (comma-separated)
          </label>
          <Input
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            placeholder="No smoking, No pets"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditRoomModal({
  open,
  onClose,
  room,
  roomTypes,
  onUpdate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  room: PrimaryRoom;
  roomTypes: { id: string; name: string }[];
  onUpdate: (data: Record<string, unknown>) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: room.name,
    description: room.description,
    price: String(room.price),
    capacity: String(room.capacity),
    bedType: room.bedType,
    roomTypeId: room.roomTypeId,
    isAvailable: room.isAvailable,
    facilities: room.facilities.join(", "),
    rules: room.rules.join(", "),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      capacity: Number(form.capacity),
      bedType: form.bedType,
      roomTypeId: form.roomTypeId,
      isAvailable: form.isAvailable,
      facilities: form.facilities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rules: form.rules
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit: ${room.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Room Type
            </label>
            <select
              value={form.roomTypeId}
              onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-primary/50"
              required
            >
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Price/Night ($)
            </label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Capacity
            </label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Bed Type
            </label>
            <Input
              value={form.bedType}
              onChange={(e) => setForm({ ...form, bedType: e.target.value })}
              required
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm({ ...form, isAvailable: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-primary"
              />
              Available
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
            Description
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
            Facilities
          </label>
          <Input
            value={form.facilities}
            onChange={(e) => setForm({ ...form, facilities: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
            Rules
          </label>
          <Input
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RoomImagesModal({
  open,
  onClose,
  room,
  onUpload,
  onDeleteImage,
  isUploading,
  isAdmin,
}: {
  open: boolean;
  onClose: () => void;
  room: PrimaryRoom;
  onUpload: (formData: FormData) => Promise<void>;
  onDeleteImage: (imageId: string) => Promise<void>;
  isUploading: boolean;
  isAdmin: boolean;
}) {
  const { data: images, isLoading } = useRoomImages(room.id);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    setStagedFiles((prev) => [...prev, ...imageFiles].slice(0, 3));
    setUploadDone(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadDone(false);
  };

  const handleConfirmUpload = async () => {
    if (!stagedFiles.length) return;
    const formData = new FormData();
    stagedFiles.forEach((file) => formData.append("images", file));
    await onUpload(formData);
    setStagedFiles([]);
    setUploadDone(true);
  };

  const handleClose = () => {
    setStagedFiles([]);
    setUploadDone(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Images: ${room.name}`}
      description="Drag & drop or browse to add up to 3 images at a time."
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Drag & drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm transition-all ${
            isDragging
              ? "border-primary bg-[#f3f0ff] text-primary"
              : "border-slate-200 text-slate-400 hover:border-primary hover:text-primary hover:bg-[#f3f0ff]/50"
          }`}
        >
          <UploadCloud size={28} />
          <p>
            <span className="font-medium">Drag & drop images here</span> or
            click to browse
          </p>
          <p className="text-xs text-slate-400">Max 3 images per upload</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Staged files preview */}
        {stagedFiles.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500">
              Selected ({stagedFiles.length}/3)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {stagedFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="group relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={200}
                    height={150}
                    className="aspect-video w-full rounded-xl object-cover"
                  />
                  <button
                    onClick={() => removeStagedFile(i)}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-600 p-0.5 text-white shadow-sm hover:bg-rose-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <UploadCloud size={16} className="animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Confirm Upload
                </>
              )}
            </button>
          </div>
        )}

        {/* Upload success */}
        {uploadDone && stagedFiles.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle size={16} />
            Images uploaded successfully!
          </div>
        )}

        {/* Existing images */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : images?.length ? (
          <>
            <p className="text-xs font-medium text-slate-500">
              Uploaded images ({images.length})
            </p>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <Image
                    src={img.imageUrl}
                    alt="Room"
                    width={200}
                    height={150}
                    className="aspect-video w-full rounded-xl object-cover"
                  />
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm("Delete?")) onDeleteImage(img.id);
                      }}
                      className="absolute right-1 top-1 hidden rounded-lg bg-rose-500/90 p-1 text-white group-hover:block"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-slate-400 py-8">
            No images uploaded yet.
          </p>
        )}

        {/* Done button */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
