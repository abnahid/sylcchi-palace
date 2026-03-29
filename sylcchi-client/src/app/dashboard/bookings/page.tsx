"use client";

import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { useAllBookings, useCompleteRefund } from "@/hooks/useDashboard";
import type { AdminBookingData } from "@/lib/types/dashboard";
import { format } from "date-fns";
import { Eye, RefreshCcw, Search } from "lucide-react";
import { useState } from "react";

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selected, setSelected] = useState<AdminBookingData | null>(null);

  const {
    data: bookingsData,
    isLoading,
    refetch,
  } = useAllBookings({
    page,
    limit: 20,
    status: statusFilter || undefined,
    paymentStatus: paymentFilter || undefined,
    search: search || undefined,
  });

  const completeRefund = useCompleteRefund();
  const bookings = bookingsData?.data ?? [];
  const meta = bookingsData?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRefund = async (bookingId: string) => {
    if (!confirm("Mark this refund as completed?")) return;
    await completeRefund.mutateAsync({ bookingId });
    setSelected(null);
  };

  const columns: Column<AdminBookingData>[] = [
    {
      key: "bookingCode",
      header: "Booking ID",
      render: (row) => (
        <span className="font-mono text-slate-500">#{row.bookingCode}</span>
      ),
    },
    {
      key: "user",
      header: "Guest",
      render: (row) => {
        const name =
          row.user?.name ?? row.guestDetails?.[0]?.name ?? "Guest";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const colors = [
          "bg-blue-100 text-blue-600",
          "bg-purple-100 text-purple-600",
          "bg-rose-100 text-rose-600",
          "bg-teal-100 text-teal-600",
        ];
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors[name.charCodeAt(0) % colors.length]}`}
            >
              {initials}
            </div>
            <span className="font-medium text-[#1a1a1a]">{name}</span>
          </div>
        );
      },
    },
    {
      key: "room",
      header: "Room",
      render: (row) => (
        <span className="text-slate-600">{row.room?.name ?? "—"}</span>
      ),
    },
    {
      key: "checkInDate",
      header: "Check-in",
      render: (row) => (
        <span className="text-slate-500">
          {format(new Date(row.checkInDate), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "totalPrice",
      header: "Amount",
      render: (row) => (
        <span className="font-medium text-[#1a1a1a]">
          ${Number(row.totalPrice).toLocaleString()}
        </span>
      ),
    },
    {
      key: "bookingStatus",
      header: "Booking",
      render: (row) => <StatusBadge status={row.bookingStatus} />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (row) => <StatusBadge status={row.paymentStatus} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelected(row);
          }}
          className="text-slate-400 hover:text-[#5802f7] transition-colors"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  // Pagination footer
  const tableFooter = meta && meta.totalPages > 1 && (
    <>
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-[#1a1a1a]">
          {(meta.page - 1) * meta.limit + 1}-
          {Math.min(meta.page * meta.limit, meta.total)}
        </span>{" "}
        of <span className="font-medium text-[#1a1a1a]">{meta.total}</span>
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors disabled:opacity-40"
        >
          Prev
        </button>
        <span className="px-3 py-1 rounded-md bg-[#5802f7] text-white text-xs shadow-md shadow-[#5802f7]/20">
          {meta.page}
        </span>
        {meta.page < meta.totalPages && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description={`${meta?.total ?? 0} total reservations across all guests.`}
        actions={
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-[#5802f7]/30 hover:text-[#5802f7] transition-all"
          >
            <Icon icon="solar:refresh-linear" width={16} />
            Refresh
          </button>
        }
      />

      {/* Filters bar (inside the table card) */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
              All Reservations
            </h3>
            <p className="text-xs text-slate-400">Booking history</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search booking..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#5802f7]/50 transition-colors w-full sm:w-48"
              />
            </form>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val === "all" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter}
              onValueChange={(val) => {
                setPaymentFilter(val === "all" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-[130px]">
                <SelectValue placeholder="All Payment" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
            {(search || statusFilter || paymentFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setStatusFilter("");
                  setPaymentFilter("");
                  setPage(1);
                }}
                className="px-3 py-2 text-sm text-slate-500 hover:text-[#5802f7] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table (inline, no extra wrapper) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {columns.map((col) => (
                  <th key={col.key} className={`px-6 py-4 ${col.className ?? ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 last:border-0"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : bookings.length === 0
                  ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        No bookings found
                      </td>
                    </tr>
                  )
                  : bookings.map((row) => (
                    <tr
                      key={row.id}
                      className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-6 py-4 ${col.className ?? ""}`}
                        >
                          {col.render
                            ? col.render(row)
                            : String(
                                (row as unknown as Record<string, unknown>)[col.key] ?? "",
                              )}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {tableFooter && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
            {tableFooter}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Booking Details"
        description={`Booking #${selected?.bookingCode ?? ""}`}
      >
        {selected && (
          <div className="space-y-4">
            {selected.user && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Guest
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.user.name}
                </p>
                <p className="text-sm text-slate-500">{selected.user.email}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Room</p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.room?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Guests</p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.guests}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Check-in</p>
                <p className="font-medium text-[#1a1a1a]">
                  {format(new Date(selected.checkInDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Check-out</p>
                <p className="font-medium text-[#1a1a1a]">
                  {format(new Date(selected.checkOutDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Nights</p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.nights}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Payment Method</p>
                <p className="font-medium text-[#1a1a1a] capitalize">
                  {selected.paymentMethod.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">
                Pricing
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Price</span>
                  <span>${Number(selected.basePrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Subtotal ({selected.nights} nights)
                  </span>
                  <span>${Number(selected.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VAT</span>
                  <span>${Number(selected.vat).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-[#1a1a1a]">
                  <span>Total</span>
                  <span>${Number(selected.totalPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Paid</span>
                  <span>${Number(selected.paidAmount).toLocaleString()}</span>
                </div>
                {Number(selected.remainingAmount) > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Remaining</span>
                    <span>
                      ${Number(selected.remainingAmount).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selected.checkin && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Check-in
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.checkin.status} />
                  {selected.checkin.checkinTime && (
                    <span className="text-sm text-slate-500">
                      {format(
                        new Date(selected.checkin.checkinTime),
                        "MMM dd, yyyy HH:mm",
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <StatusBadge status={selected.bookingStatus} />
              <StatusBadge status={selected.paymentStatus} />
              {selected.payment?.refundStatus &&
                selected.payment.refundStatus !== "NONE" && (
                  <StatusBadge status={selected.payment.refundStatus} />
                )}
            </div>

            <RoleGuard roles={["ADMIN"]}>
              {selected.bookingStatus === "CANCELLED" &&
                selected.payment?.refundStatus === "PENDING" && (
                  <button
                    onClick={() => handleRefund(selected.id)}
                    disabled={completeRefund.isPending}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 hover:shadow-[#5802f7]/50 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {completeRefund.isPending
                      ? "Processing..."
                      : "Complete Refund"}
                  </button>
                )}
            </RoleGuard>
          </div>
        )}
      </Modal>
    </div>
  );
}
