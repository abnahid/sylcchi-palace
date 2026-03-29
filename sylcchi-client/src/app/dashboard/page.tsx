"use client";

import DataTable, { type Column } from "@/components/dashboard/DataTable";
import PageHeader from "@/components/dashboard/PageHeader";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Icon } from "@iconify/react";
import {
  useAllBookings,
  useAdminUsers,
  useDashboardRooms,
  useDashboardRoomTypes,
} from "@/hooks/useDashboard";
import type { AdminBookingData, PrimaryRoom } from "@/lib/types/dashboard";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ITEMS_PER_PAGE = 5;

export default function DashboardOverviewPage() {
  const [bookingPage, setBookingPage] = useState(1);
  const [roomPage, setRoomPage] = useState(1);

  const { data: roomsData, isLoading: roomsLoading } = useDashboardRooms({
    page: String(roomPage),
    limit: String(ITEMS_PER_PAGE),
  });
  const { data: roomTypes } = useDashboardRoomTypes();
  const { data: bookingsData, isLoading: bookingsLoading } = useAllBookings({
    page: bookingPage,
    limit: ITEMS_PER_PAGE,
  });
  const { data: users } = useAdminUsers();

  const rooms = roomsData?.data ?? [];
  const totalRooms = roomsData?.meta?.total ?? 0;
  const roomTotalPages = roomsData?.meta?.totalPages ?? 1;
  const availableRooms = rooms.filter((r) => r.isAvailable).length;
  const occupiedRooms = rooms.length - availableRooms;

  const bookings = bookingsData?.data ?? [];
  const totalBookings = bookingsData?.meta?.total ?? 0;
  const bookingTotalPages = bookingsData?.meta?.totalPages ?? 1;
  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.paidAmount),
    0,
  );

  const revenueChartData = buildRevenueChart(bookings);

  const occupancyData = [
    { name: "Available", value: availableRooms || 1, color: "#5802f7" },
    { name: "Occupied", value: occupiedRooms || 0, color: "#2dd4bf" },
  ];

  const bookingColumns: Column<AdminBookingData>[] = [
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
          "bg-orange-100 text-orange-600",
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
      header: "Date",
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
      header: "Status",
      render: (row) => <StatusBadge status={row.bookingStatus} />,
    },
  ];

  const roomColumns: Column<PrimaryRoom>[] = [
    {
      key: "name",
      header: "Room",
      render: (row) => (
        <span className="font-medium text-[#1a1a1a]">{row.name}</span>
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
      header: "Price",
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
      key: "isAvailable",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isAvailable ? "AVAILABLE" : "UNAVAILABLE"} />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <PageHeader
        title="Dashboard"
        description="Here's what's happening at Sylcchi Palace today."
        actions={
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 hover:shadow-[#5802f7]/50 hover:-translate-y-0.5 transition-all">
            <Icon icon="solar:add-circle-linear" width={18} />
            <span>New Report</span>
          </button>
        }
      />

      {/* Stats — exact Solar icons from reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}.00`}
          icon="solar:dollar-minimalistic-linear"
          color="purple"
          trend={{ value: "12.5%", positive: true }}
        />
        <StatsCard
          title="Total Bookings"
          value={totalBookings.toLocaleString()}
          icon="solar:bag-3-linear"
          color="blue"
          trend={{ value: `${confirmedCount} confirmed`, positive: true }}
        />
        <StatsCard
          title="Total Rooms"
          value={totalRooms}
          icon="solar:users-group-two-rounded-linear"
          color="orange"
          trend={{
            value: `${availableRooms} available`,
            positive: availableRooms > 0,
          }}
        />
        <RoleGuard roles={["ADMIN"]}>
          <StatsCard
            title="Total Users"
            value={users?.length ?? 0}
            icon="solar:pie-chart-2-linear"
            color="teal"
            trend={{
              value: `${roomTypes?.length ?? 0} types`,
              positive: true,
            }}
          />
        </RoleGuard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
        <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/booking"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-[#5802f7]/30 hover:text-[#5802f7] transition-all"
          >
            <Icon icon="solar:calendar-add-linear" width={18} />
            Create Booking
          </a>
          <a
            href="/dashboard/checkin"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-[#5802f7]/30 hover:text-[#5802f7] transition-all"
          >
            <Icon icon="solar:clipboard-check-linear" width={18} />
            Quick Check-in
          </a>
          <RoleGuard roles={["ADMIN"]}>
            <a
              href="/dashboard/rooms"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-[#5802f7]/30 hover:text-[#5802f7] transition-all"
            >
              <Icon icon="solar:add-square-linear" width={18} />
              Add Room
            </a>
          </RoleGuard>
          <a
            href="/dashboard/bookings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-[#5802f7]/30 hover:text-[#5802f7] transition-all"
          >
            <Icon icon="solar:wallet-money-linear" width={18} />
            Payment Control
          </a>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
                Revenue Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Booking revenue by date
              </p>
            </div>
            <button className="text-slate-400 hover:text-[#5802f7] transition-colors">
              <Icon icon="solar:menu-dots-linear" width={24} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#5802f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5802f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5802f7"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  dot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "#5802f7",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, fill: "#5802f7" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Doughnut */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col">
          <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-1">
            Room Occupancy
          </h3>
          <p className="text-xs text-slate-400 mb-6">Current availability</p>
          <div className="relative h-48 w-full flex justify-center mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#5802f7]" />
                <span className="text-slate-600">Available</span>
              </div>
              <span className="font-semibold text-[#1a1a1a]">
                {availableRooms}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400" />
                <span className="text-slate-600">Occupied</span>
              </div>
              <span className="font-semibold text-[#1a1a1a]">
                {occupiedRooms}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings — paginated */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
              Recent Bookings
            </h3>
            <p className="text-xs text-slate-400">Latest reservations</p>
          </div>
        </div>
        <DataTable
          columns={bookingColumns}
          data={bookings}
          isLoading={bookingsLoading}
          emptyMessage="No bookings found"
          rowKey={(row) => row.id}
          footer={
            bookingTotalPages > 1 ? (
              <Pagination
                page={bookingPage}
                totalPages={bookingTotalPages}
                total={totalBookings}
                limit={ITEMS_PER_PAGE}
                onPageChange={setBookingPage}
              />
            ) : undefined
          }
        />
      </div>

      {/* Room Status — paginated */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
              Room Status
            </h3>
            <p className="text-xs text-slate-400">Room availability</p>
          </div>
        </div>
        <DataTable
          columns={roomColumns}
          data={rooms}
          isLoading={roomsLoading}
          emptyMessage="No rooms found"
          rowKey={(row) => row.id}
          footer={
            roomTotalPages > 1 ? (
              <Pagination
                page={roomPage}
                totalPages={roomTotalPages}
                total={totalRooms}
                limit={ITEMS_PER_PAGE}
                onPageChange={setRoomPage}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}

// ── Pagination Component ──

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <>
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-[#1a1a1a]">
          {from}-{to}
        </span>{" "}
        of <span className="font-medium text-[#1a1a1a]">{total}</span>
      </p>
      <div className="flex gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={
                p === page
                  ? "px-3 py-1 rounded-md bg-[#5802f7] text-white text-xs shadow-md shadow-[#5802f7]/20"
                  : "px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors"
              }
            >
              {p}
            </button>
          );
        })}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:border-[#5802f7] hover:text-[#5802f7] text-xs transition-colors disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          Next
        </button>
      </div>
    </>
  );
}

// ── Chart helper ──

function buildRevenueChart(
  bookings: AdminBookingData[],
): { label: string; revenue: number }[] {
  if (bookings.length === 0) {
    return [
      { label: "Jan", revenue: 0 },
      { label: "Feb", revenue: 0 },
      { label: "Mar", revenue: 0 },
    ];
  }

  const monthMap = new Map<string, number>();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  for (const b of bookings) {
    const d = new Date(b.checkInDate);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(b.paidAmount));
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => {
      const month = Number(key.split("-")[1]);
      return { label: monthNames[month], revenue };
    });
}
