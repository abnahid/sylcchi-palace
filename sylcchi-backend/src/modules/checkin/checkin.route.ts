import { Router } from "express";
import { checkinDocumentUpload } from "../../config/multer.config";
import { CheckinController } from "./checkin.controller";

export const checkinRouter = Router();

checkinRouter.post(
  "/upload-documents",
  checkinDocumentUpload.array("documents", 2),
  CheckinController.uploadDocuments,
);
checkinRouter.post("/lookup", CheckinController.lookupBooking);
checkinRouter.post("/verify-otp", CheckinController.verifyOtp);
checkinRouter.post("/complete", CheckinController.completeCheckin);
