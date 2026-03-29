import { PaymentMethod, PaymentStatus, Prisma, RefundStatus } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

type ListPaymentsFilters = {
  page: number;
  limit: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  refundStatus?: RefundStatus;
  search?: string;
};

export const PaymentService = {
  listPayments: async (filters: ListPaymentsFilters) => {
    const skip = (filters.page - 1) * filters.limit;

    const where: Prisma.PaymentWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
      ...(filters.refundStatus && filters.refundStatus !== RefundStatus.NONE
        ? { refundStatus: filters.refundStatus }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { transactionId: { contains: filters.search, mode: "insensitive" } },
              {
                reservation: {
                  user: {
                    email: { contains: filters.search, mode: "insensitive" },
                  },
                },
              },
              {
                reservation: {
                  user: {
                    name: { contains: filters.search, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, payments] = await prisma.$transaction([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include: {
          reservation: {
            select: {
              id: true,
              bookingCode: true,
              checkInDate: true,
              checkOutDate: true,
              bookingStatus: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              room: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.limit,
      }),
    ]);

    return {
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
      data: payments,
    };
  },

  getPaymentById: async (id: string) => {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },
};
