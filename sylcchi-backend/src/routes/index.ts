import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { roomRouter } from "../modules/room/room.route";

export const appRouter = Router();

appRouter.use("/api/v1/auth", authRouter);
appRouter.use("/api/v1/rooms", roomRouter);
