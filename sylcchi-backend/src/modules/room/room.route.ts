import { Router } from "express";
import { routeAccess } from "../../middleware/auth";
import { RoomController } from "./room.controller";

export const roomRouter = Router();

// POST only: Admin can create rooms.
roomRouter.post("/", ...routeAccess.admin, RoomController.createRoom);
