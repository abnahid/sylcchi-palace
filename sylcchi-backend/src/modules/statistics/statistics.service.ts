import { BookingStatus, CheckinStatus, PaymentStatus } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
}

function calcPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const StatisticsService = {
  getDashboardStats: async () => {
    const now = new Date();
    const currentMonth = getMonthRange(now);
    const prevMonth = getMonthRange(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
    );

    const [
      // Revenue
      totalRevenueResult,
      currentMonthRevenue,
      prevMonthRevenue,

      // Bookings
      totalBookings,
      confirmedBookings,
      currentMonthBookings,
      prevMonthBookings,

      // Rooms
      totalRooms,
      availableRooms,
      totalRoomTypes,

      // Users
      totalUsers,
      currentMonthUsers,
      prevMonthUsers,

      // Occupancy - rooms currently checked in
      occupiedRooms,
    ] = await prisma.$transaction([
      // Total revenue from successful payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.SUCCESS },
      }),

      // Current month revenue
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: currentMonth.start, lt: currentMonth.end },
        },
      }),

      // Previous month revenue
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: prevMonth.start, lt: prevMonth.end },
        },
      }),

      // Total bookings
      prisma.reservation.count(),

      // Confirmed bookings
      prisma.reservation.count({
        where: { bookingStatus: BookingStatus.CONFIRMED },
      }),

      // Current month bookings
      prisma.reservation.count({
        where: {
          createdAt: { gte: currentMonth.start, lt: currentMonth.end },
        },
      }),

      // Previous month bookings
      prisma.reservation.count({
        where: {
          createdAt: { gte: prevMonth.start, lt: prevMonth.end },
        },
      }),

      // Total rooms
      prisma.room.count(),

      // Available rooms
      prisma.room.count({ where: { isAvailable: true } }),

      // Total room types
      prisma.roomType.count(),

      // Total users
      prisma.user.count(),

      // Current month users
      prisma.user.count({
        where: {
          createdAt: { gte: currentMonth.start, lt: currentMonth.end },
        },
      }),

      // Previous month users
      prisma.user.count({
        where: {
          createdAt: { gte: prevMonth.start, lt: prevMonth.end },
        },
      }),

      // Currently occupied rooms (checked in, not checked out)
      prisma.checkin.count({
        where: { status: CheckinStatus.CHECKED_IN },
      }),
    ]);

    const totalRevenue = toNumber(totalRevenueResult._sum.amount);
    const curRevenue = toNumber(currentMonthRevenue._sum.amount);
    const prvRevenue = toNumber(prevMonthRevenue._sum.amount);

    return {
      totalRevenue: {
        amount: totalRevenue,
        changePercent: calcPercentageChange(curRevenue, prvRevenue),
      },
      totalBookings: {
        count: totalBookings,
        confirmed: confirmedBookings,
        changePercent: calcPercentageChange(currentMonthBookings, prevMonthBookings),
      },
      totalRooms: {
        count: totalRooms,
        available: availableRooms,
        types: totalRoomTypes,
      },
      totalUsers: {
        count: totalUsers,
        changePercent: calcPercentageChange(currentMonthUsers, prevMonthUsers),
      },
      roomOccupancy: {
        available: totalRooms - occupiedRooms,
        occupied: occupiedRooms,
      },
    };
  },

  getRevenueAnalytics: async (months: number) => {
    const now = new Date();
    const data: { month: string; revenue: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = getMonthRange(date);

      const result = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: start, lt: end },
        },
      });

      const monthName = date.toLocaleString("en-US", { month: "short" });

      data.push({
        month: monthName,
        revenue: toNumber(result._sum.amount),
      });
    }

    return data;
  },
};
