import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { reservationRouter } from "../modules/reservation/reservation.route";
import { roomRouter } from "../modules/room/room.route";
import { roomImageRouter } from "../modules/roomImage/roomImage.route";
import { webhookRouter } from "../modules/webhook/webhook.route";

export const appRouter = Router();

appRouter.use("/api/v1/auth", authRouter);
appRouter.use("/api/v1/bookings", reservationRouter);
appRouter.use("/api/v1/rooms", roomRouter);
appRouter.use("/api/v1/rooms", roomImageRouter);
appRouter.use("/api/webhooks", webhookRouter);
