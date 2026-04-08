import { Router } from "express";
import { routeAccess } from "../../middleware/auth";
import { ChatbotController } from "./chatbot.controller";

export const chatbotRouter = Router();

chatbotRouter.post("/chat", routeAccess.public, ChatbotController.chat);
