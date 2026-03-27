import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth";
import { ReviewController } from "./review.controller";

export const reviewRouter = Router();

reviewRouter.get("/:roomId/reviews", ReviewController.getRoomReviews);
reviewRouter.get(
  "/:roomId/reviews/eligibility",
  optionalAuth,
  ReviewController.getEligibility,
);
reviewRouter.post(
  "/:roomId/reviews",
  requireAuth,
  ReviewController.upsertReview,
);
