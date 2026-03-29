import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { checkinRouter } from "../modules/checkin/checkin.route";
import { paymentRouter } from "../modules/payment/payment.route";
import { reservationRouter } from "../modules/reservation/reservation.route";
import { reviewRouter } from "../modules/review/review.route";
import { roomRouter } from "../modules/room/room.route";
import { roomImageRouter } from "../modules/roomImage/roomImage.route";
import { statisticsRouter } from "../modules/statistics/statistics.route";
import { userRouter } from "../modules/user/user.route";
import { webhookRouter } from "../modules/webhook/webhook.route";
import { wishlistRouter } from "../modules/wishlist/wishlist.route";

export const appRouter = Router();

appRouter.use("/api/v1/auth", authRouter);
appRouter.use("/api/v1/bookings", reservationRouter);
appRouter.use("/api/v1/checkin", checkinRouter);
appRouter.use("/api/v1/payments", paymentRouter);
appRouter.use("/api/v1/rooms", roomRouter);
appRouter.use("/api/v1/statistics", statisticsRouter);
appRouter.use("/api/v1/rooms", roomImageRouter);
appRouter.use("/api/v1/rooms", reviewRouter);
appRouter.use("/api/v1/users", userRouter);
appRouter.use("/api/v1/wishlist", wishlistRouter);
appRouter.use("/api/webhooks", webhookRouter);
