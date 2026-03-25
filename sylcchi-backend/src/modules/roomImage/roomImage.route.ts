import { Router } from "express";
import { imageUpload } from "../../config/multer.config";
import { routeAccess } from "../../middleware/auth";
import { RoomImageController } from "./roomImage.controller";

export const roomImageRouter = Router();

roomImageRouter.get(
  "/:roomId/images",
  routeAccess.public,
  RoomImageController.listRoomImages,
);
roomImageRouter.post(
  "/:roomId/images/urls",
  ...routeAccess.adminOrManager,
  RoomImageController.addRoomImageUrls,
);
roomImageRouter.post(
  "/:roomId/images/upload",
  ...routeAccess.adminOrManager,
  imageUpload.array("images", 3),
  RoomImageController.uploadRoomImages,
);
roomImageRouter.patch(
  "/:roomId/images/:imageId/url",
  ...routeAccess.adminOrManager,
  RoomImageController.updateRoomImageUrl,
);
roomImageRouter.delete(
  "/:roomId/images/:imageId",
  ...routeAccess.admin,
  RoomImageController.deleteRoomImage,
);
