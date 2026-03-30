import { Router } from "express";
import { profileImageUpload } from "../../config/multer.config";
import { requireAuth, routeAccess } from "../../middleware/auth";
import { UserController } from "./user.controller";

export const userRouter = Router();

userRouter.get("/profile", requireAuth, UserController.getMyProfile);
userRouter.patch("/profile", requireAuth, UserController.updateMyProfile);
userRouter.patch(
  "/profile/image",
  requireAuth,
  profileImageUpload.single("image"),
  UserController.uploadProfileImage,
);
userRouter.get("/", ...routeAccess.admin, UserController.listUsers);
userRouter.get("/:id", ...routeAccess.admin, UserController.getUserById);
userRouter.patch("/:id", ...routeAccess.admin, UserController.updateUser);
userRouter.delete("/:id", ...routeAccess.admin, UserController.deleteUser);
