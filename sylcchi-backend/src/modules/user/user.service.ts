import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

type ListUsersFilters = {
  search?: string;
  role?: "CUSTOMER" | "MANAGER" | "ADMIN";
  emailVerified?: boolean;
  page: number;
  limit: number;
};

type UpdateUserPayload = {
  name?: string;
  phone?: string;
  role?: "CUSTOMER" | "MANAGER" | "ADMIN";
  emailVerified?: boolean;
  image?: string;
};

type UpdateMyProfilePayload = {
  name?: string;
  phone?: string;
  image?: string;
};

export const UserService = {
  listUsers: async (filters: ListUsersFilters) => {
    const skip = (filters.page - 1) * filters.limit;

    const where = {
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
              {
                phone: {
                  contains: filters.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(typeof filters.emailVerified === "boolean"
        ? { emailVerified: filters.emailVerified }
        : {}),
    };

    const [total, data] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: filters.limit,
      }),
    ]);

    return {
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
      data,
    };
  },

  getUserById: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    return user;
  },

  updateUser: async (userId: string, payload: UpdateUserPayload) => {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    return prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  updateMyProfile: async (userId: string, payload: UpdateMyProfilePayload) => {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    return prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  deleteUser: async (userId: string, actorId?: string) => {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    if (actorId && actorId === userId) {
      throw new AppError(
        "You cannot delete your own admin account",
        status.BAD_REQUEST,
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return null;
  },
};
