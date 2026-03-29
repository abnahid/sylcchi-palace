"use client";

import { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePayments } from "@/hooks/useDashboard";
import type { PaymentRecord } from "@/lib/types/dashboard";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { Eye, Search } from "lucide-react";
import { useState } from "react";

const ITEMS_PER_PAGE = 6;

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  const { data: paymentsData, isLoading, refetch } = usePayments({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter || undefined,
    paymentMethod: methodFilter || undefined,
    search: search || undefined,
  });

  const payments = paymentsData?.data ?? [];
  const meta = paymentsData?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const columns: Column<PaymentRecord>[] = [
    {
      key: "transactionId",
      header: "Transaction",
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.transactionId ?? "—"}
        </span>
      ),
    },
    {
      key: "reservation",
      header: "Guest",
      render: (row) => {
        const name = row.reservation?.user?.name ?? "Guest";
        const email = row.reservation?.user?.email ?? "";
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
            <div>
              <p className="font-medium text-[#1a1a1a]">{name}</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "bookingCode",
      header: "Booking",
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          #{row.reservation?.bookingCode ?? "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-medium text-[#1a1a1a]">
          {row.currency === "BDT" ? "৳" : "$"}
          {Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (row) => (
        <span className="text-slate-600 text-xs uppercase">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: "paymentType",
      header: "Type",
      render: (row) => (
        <span className="text-slate-500 capitalize text-xs">
          {row.paymentType?.toLowerCase()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "refundStatus",
      header: "Refund",
      render: (row) =>
        row.refundStatus !== "NONE" ? (
          <StatusBadge status={row.refundStatus} />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
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
          className="text-slate-400 hover:text-primary transition-colors"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

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
      <div className="flex gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-primary hover:text-primary text-xs transition-colors disabled:opacity-40"
        >
          Prev
        </button>
        {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map(
          (p) => (
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
          ),
        )}
        <button
          disabled={page >= meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-primary hover:text-primary text-xs transition-colors disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description={`${meta?.total ?? 0} total payment records.`}
        actions={
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-primary/30 hover:text-primary transition-all"
          >
            <Icon icon="solar:refresh-linear" width={16} />
            Refresh
          </button>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
              Payment History
            </h3>
            <p className="text-xs text-slate-400">All payment transactions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search email, code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-48"
              />
            </form>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val === "all" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-[120px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={methodFilter}
              onValueChange={(val) => {
                setMethodFilter(val === "all" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-[120px]">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
                <SelectItem value="SSLCOMMERZ">SSLCommerz</SelectItem>
                <SelectItem value="PAY_LATER">Pay Later</SelectItem>
              </SelectContent>
            </Select>
            {(search || statusFilter || methodFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setStatusFilter("");
                  setMethodFilter("");
                  setPage(1);
                }}
                className="px-3 py-2 text-sm text-slate-500 hover:text-primary transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 ${col.className ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((row) => (
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
                              (row as unknown as Record<string, unknown>)[
                                col.key
                              ] ?? "",
                            )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
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

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Payment Details"
        description={
          selected?.transactionId
            ? `Transaction ${selected.transactionId}`
            : "Payment record"
        }
      >
        {selected && (
          <div className="space-y-4">
            {/* Guest */}
            {selected.reservation?.user && (
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="text-xs uppercase font-semibold text-slate-400 mb-1">
                  Guest
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.reservation.user.name}
                </p>
                <p className="text-slate-500">
                  {selected.reservation.user.email}
                </p>
              </div>
            )}

            {/* Booking info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Booking Code</p>
                <p className="font-mono font-medium text-[#1a1a1a]">
                  #{selected.reservation?.bookingCode ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Room</p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.reservation?.room?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Check-in</p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.reservation?.checkInDate
                    ? format(
                        new Date(selected.reservation.checkInDate),
                        "MMM dd, yyyy",
                      )
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Check-out</p>
                <p className="font-medium text-[#1a1a1a]">
                  {selected.reservation?.checkOutDate
                    ? format(
                        new Date(selected.reservation.checkOutDate),
                        "MMM dd, yyyy",
                      )
                    : "—"}
                </p>
              </div>
            </div>

            {/* Payment details */}
            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">
                Payment Info
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-semibold text-[#1a1a1a]">
                    {selected.currency === "BDT" ? "৳" : "$"}
                    {Number(selected.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency</span>
                  <span>{selected.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Method</span>
                  <span className="uppercase">{selected.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="capitalize">
                    {selected.paymentType?.toLowerCase()}
                  </span>
                </div>
                {selected.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID</span>
                    <span className="font-mono text-xs">
                      {selected.transactionId}
                    </span>
                  </div>
                )}
                {selected.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span>
                      {format(
                        new Date(selected.createdAt),
                        "MMM dd, yyyy HH:mm",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
              <StatusBadge status={selected.reservation?.bookingStatus ?? ""} />
              {selected.refundStatus !== "NONE" && (
                <StatusBadge status={selected.refundStatus} />
              )}
            </div>

            {/* Refund info */}
            {selected.refundAmount && Number(selected.refundAmount) > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">
                <p className="font-medium text-amber-700">
                  Refund: {selected.currency === "BDT" ? "৳" : "$"}
                  {Number(selected.refundAmount).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
