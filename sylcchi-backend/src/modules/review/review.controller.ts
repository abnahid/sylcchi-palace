import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { ReviewService } from "./review.service";

type RatingsInput = {
  location: number;
  comfort: number;
  service: number;
  pricing: number;
};

function getRoomId(req: Request): string {
  const roomId = req.params.roomId;

  if (!roomId || roomId.trim() === "") {
    throw new AppError("roomId is required", status.BAD_REQUEST);
  }

  return roomId;
}

function asBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Request body is required", status.BAD_REQUEST);
  }

  return body as Record<string, unknown>;
}

function getRatings(body: Record<string, unknown>): RatingsInput {
  const ratingsRaw = body.ratings;

  if (
    !ratingsRaw ||
    typeof ratingsRaw !== "object" ||
    Array.isArray(ratingsRaw)
  ) {
    throw new AppError("ratings is required", status.BAD_REQUEST);
  }

  const ratings = ratingsRaw as Record<string, unknown>;

  const location = ratings.location;
  const comfort = ratings.comfort;
  const service = ratings.service;
  const pricing = ratings.pricing;

  if (
    typeof location !== "number" ||
    typeof comfort !== "number" ||
    typeof service !== "number" ||
    typeof pricing !== "number"
  ) {
    throw new AppError(
      "ratings.location, ratings.comfort, ratings.service and ratings.pricing must be numbers",
      status.BAD_REQUEST,
    );
  }

  return {
    location,
    comfort,
    service,
    pricing,
  };
}

function getOptionalComment(body: Record<string, unknown>): string | undefined {
  const comment = body.comment;

  if (comment === undefined || comment === null) {
    return undefined;
  }

  if (typeof comment !== "string") {
    throw new AppError("comment must be a string", status.BAD_REQUEST);
  }

  return comment;
}

export const ReviewController = {
  getEligibility: async (req: Request, res: Response) => {
    const result = await ReviewService.getEligibility({
      roomId: getRoomId(req),
      userId: req.user?.id,
    });

    res.status(status.OK).json({
      success: true,
      message: "Review eligibility fetched successfully",
      data: result,
    });
  },

  upsertReview: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Authentication required", status.UNAUTHORIZED);
    }

    const body = asBodyObject(req.body);

    const result = await ReviewService.upsertReview({
      roomId: getRoomId(req),
      userId: req.user.id,
      ratings: getRatings(body),
      comment: getOptionalComment(body),
    });

    res.status(status.OK).json({
      success: true,
      message:
        result.action === "created"
          ? "Review submitted successfully"
          : "Review updated successfully",
      data: result,
    });
  },

  getRoomReviews: async (req: Request, res: Response) => {
    const result = await ReviewService.getRoomReviews(getRoomId(req));

    res.status(status.OK).json({
      success: true,
      message: "Room reviews fetched successfully",
      data: result,
    });
  },
};
