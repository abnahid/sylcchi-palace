import { Router } from "express";
import { requireAuth, routeAccess } from "../../middleware/auth";
import { UserController } from "./user.controller";

export const userRouter = Router();

userRouter.get("/profile", requireAuth, UserController.getMyProfile);
userRouter.patch("/profile", requireAuth, UserController.updateMyProfile);
userRouter.get("/", ...routeAccess.admin, UserController.listUsers);
userRouter.get("/:id", ...routeAccess.admin, UserController.getUserById);
userRouter.patch("/:id", ...routeAccess.admin, UserController.updateUser);
userRouter.delete("/:id", ...routeAccess.admin, UserController.deleteUser);
