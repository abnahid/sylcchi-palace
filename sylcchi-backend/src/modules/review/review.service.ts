import status from "http-status";
import {
  BookingPaymentStatus,
  BookingStatus,
  CheckinStatus,
} from "../../../generated/prisma";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

type ReviewRatingsInput = {
  location: number;
  comfort: number;
  service: number;
  pricing: number;
};

type ReviewPayload = {
  roomId: string;
  userId: string;
  ratings: ReviewRatingsInput;
  comment?: string;
};

function validateRating(value: number, key: string): number {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new AppError(
      `${key} must be an integer between 1 and 5`,
      status.BAD_REQUEST,
    );
  }

  return value;
}

function normalizeComment(comment?: string): string | undefined {
  if (comment === undefined) {
    return undefined;
  }

  const trimmed = comment.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

function averageRating(ratings: ReviewRatingsInput): number {
  return Math.round(
    (ratings.location + ratings.comfort + ratings.service + ratings.pricing) /
      4,
  );
}

async function hasCompletedStay(
  userId: string,
  roomId: string,
): Promise<boolean> {
  const completedBooking = await prisma.reservation.findFirst({
    where: {
      userId,
      roomId,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: BookingPaymentStatus.PAID,
      OR: [
        {
          checkin: {
            is: {
              status: CheckinStatus.CHECKED_OUT,
            },
          },
        },
        {
          checkOutDate: {
            lte: new Date(),
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(completedBooking);
}

export const ReviewService = {
  getEligibility: async (params: { roomId: string; userId?: string }) => {
    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      select: { id: true },
    });

    if (!room) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    if (!params.userId) {
      return {
        canSubmit: false,
        reason: "LOGIN_REQUIRED",
        message: "Please login to leave a review",
      };
    }

    const eligible = await hasCompletedStay(params.userId, params.roomId);

    if (!eligible) {
      return {
        canSubmit: false,
        reason: "NO_COMPLETED_BOOKING",
        message: "Only guests who completed a stay can review this room",
      };
    }

    return {
      canSubmit: true,
      reason: "ELIGIBLE",
      message: "You can submit a review",
    };
  },

  upsertReview: async (payload: ReviewPayload) => {
    const location = validateRating(
      payload.ratings.location,
      "ratings.location",
    );
    const comfort = validateRating(payload.ratings.comfort, "ratings.comfort");
    const service = validateRating(payload.ratings.service, "ratings.service");
    const pricing = validateRating(payload.ratings.pricing, "ratings.pricing");

    const eligibility = await ReviewService.getEligibility({
      roomId: payload.roomId,
      userId: payload.userId,
    });

    if (!eligibility.canSubmit) {
      throw new AppError(eligibility.message, status.FORBIDDEN);
    }

    const data = {
      rating: averageRating({ location, comfort, service, pricing }),
      locationRating: location,
      comfortRating: comfort,
      serviceRating: service,
      pricingRating: pricing,
      comment: normalizeComment(payload.comment),
    };

    const existing = await prisma.review.findUnique({
      where: {
        userId_roomId: {
          userId: payload.userId,
          roomId: payload.roomId,
        },
      },
      select: { id: true },
    });

    const review = await prisma.review.upsert({
      where: {
        userId_roomId: {
          userId: payload.userId,
          roomId: payload.roomId,
        },
      },
      update: data,
      create: {
        userId: payload.userId,
        roomId: payload.roomId,
        ...data,
      },
      select: {
        id: true,
        userId: true,
        roomId: true,
        rating: true,
        locationRating: true,
        comfortRating: true,
        serviceRating: true,
        pricingRating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      review,
      action: existing ? "updated" : "created",
    } as const;
  },

  getRoomReviews: async (roomId: string) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!room) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    const reviews = await prisma.review.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        locationRating: true,
        comfortRating: true,
        serviceRating: true,
        pricingRating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const count = reviews.length;
    const avgOverall =
      count === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) / count
            ).toFixed(2),
          );

    return {
      stats: {
        total: count,
        averageRating: avgOverall,
      },
      reviews,
    };
  },
};
