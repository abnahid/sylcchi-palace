import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { WishlistController } from "./wishlist.controller";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get("/", WishlistController.listMyWishlist);
wishlistRouter.post("/", WishlistController.addToWishlist);
wishlistRouter.delete("/:roomId", WishlistController.removeFromWishlist);
