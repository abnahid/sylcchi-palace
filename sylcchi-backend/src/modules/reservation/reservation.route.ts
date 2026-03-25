import { Router } from "express";
import { optionalAuth } from "../../middleware/auth";
import { ReservationController } from "./reservation.controller";

export const reservationRouter = Router();

reservationRouter.use(optionalAuth);

reservationRouter.post("/create", ReservationController.createBooking);
reservationRouter.post("/pay", ReservationController.payBooking);
reservationRouter.get("/pay", ReservationController.payBooking);
reservationRouter.get("/:id", ReservationController.getBookingById);
reservationRouter.post("/cancel", ReservationController.cancelBooking);
