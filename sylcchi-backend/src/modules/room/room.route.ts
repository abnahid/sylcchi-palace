import { Router } from "express";
import { routeAccess } from "../../middleware/auth";
import { RoomController } from "./room.controller";

export const roomRouter = Router();

roomRouter.get("/types", routeAccess.public, RoomController.listRoomTypes);
roomRouter.post("/types", ...routeAccess.admin, RoomController.createRoomType);

roomRouter.get("/", routeAccess.public, RoomController.listRooms);
roomRouter.get(
  "/:roomId/booked-dates",
  routeAccess.public,
  RoomController.getBookedDates,
);
roomRouter.get("/:slug", routeAccess.public, RoomController.getSingleRoom);

roomRouter.post("/", ...routeAccess.admin, RoomController.createRoom);
roomRouter.patch(
  "/:id",
  ...routeAccess.adminOrManager,
  RoomController.updateRoom,
);
roomRouter.delete("/:id", ...routeAccess.admin, RoomController.deleteRoom);
