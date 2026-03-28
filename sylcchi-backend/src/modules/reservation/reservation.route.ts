import { Router } from "express";
import { optionalAuth, requireAuth, routeAccess } from "../../middleware/auth";
import { ReservationController } from "./reservation.controller";

export const reservationRouter = Router();

reservationRouter.use(optionalAuth);

reservationRouter.get("/my", requireAuth, ReservationController.listMyBookings);
reservationRouter.post("/create", ReservationController.createBooking);
reservationRouter.post("/pay", ReservationController.payBooking);
reservationRouter.get("/pay", ReservationController.payBooking);
reservationRouter.post(
  "/refund/complete",
  ...routeAccess.admin,
  ReservationController.markRefundCompleted,
);
reservationRouter.get("/:id", ReservationController.getBookingById);
reservationRouter.post("/cancel", ReservationController.cancelBooking);
