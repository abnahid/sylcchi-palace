import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { WishlistService } from "./wishlist.service";

function getRequiredRoomIdFromBody(req: Request): string {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new AppError("Request body is required", status.BAD_REQUEST);
  }

  const roomId = (req.body as Record<string, unknown>).roomId;

  if (typeof roomId !== "string" || roomId.trim() === "") {
    throw new AppError("roomId is required", status.BAD_REQUEST);
  }

  return roomId.trim();
}

function getRequiredRoomIdFromParams(req: Request): string {
  const roomId = req.params.roomId;

  if (!roomId || roomId.trim() === "") {
    throw new AppError("roomId is required", status.BAD_REQUEST);
  }

  return roomId.trim();
}

function getAuthUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError("Authentication required", status.UNAUTHORIZED);
  }

  return req.user.id;
}

export const WishlistController = {
  addToWishlist: async (req: Request, res: Response) => {
    const result = await WishlistService.addToWishlist({
      userId: getAuthUserId(req),
      roomId: getRequiredRoomIdFromBody(req),
    });

    res.status(status.OK).json({
      success: true,
      message:
        result.action === "created"
          ? "Added to wishlist successfully"
          : "Room already in wishlist",
      data: result,
    });
  },

  listMyWishlist: async (req: Request, res: Response) => {
    const result = await WishlistService.listMyWishlist(getAuthUserId(req));

    res.status(status.OK).json({
      success: true,
      message: "Wishlist retrieved successfully",
      data: result,
    });
  },

  removeFromWishlist: async (req: Request, res: Response) => {
    await WishlistService.removeFromWishlist({
      userId: getAuthUserId(req),
      roomId: getRequiredRoomIdFromParams(req),
    });

    res.status(status.OK).json({
      success: true,
      message: "Removed from wishlist successfully",
      data: null,
    });
  },
};
