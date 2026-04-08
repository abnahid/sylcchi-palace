import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { ChatbotService, ChatMessage } from "./chatbot.service";

const MAX_MESSAGES = 30;
const MAX_CONTENT_LENGTH = 2000;

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    throw new AppError("messages must be an array", status.BAD_REQUEST);
  }

  if (value.length === 0) {
    throw new AppError("messages must not be empty", status.BAD_REQUEST);
  }

  if (value.length > MAX_MESSAGES) {
    throw new AppError(
      `messages may not contain more than ${MAX_MESSAGES} entries`,
      status.BAD_REQUEST,
    );
  }

  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new AppError(
        `messages[${index}] must be an object`,
        status.BAD_REQUEST,
      );
    }

    const { role, content } = entry as { role?: unknown; content?: unknown };

    if (role !== "user" && role !== "model") {
      throw new AppError(
        `messages[${index}].role must be "user" or "model"`,
        status.BAD_REQUEST,
      );
    }

    if (typeof content !== "string" || content.trim() === "") {
      throw new AppError(
        `messages[${index}].content must be a non-empty string`,
        status.BAD_REQUEST,
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new AppError(
        `messages[${index}].content exceeds ${MAX_CONTENT_LENGTH} characters`,
        status.BAD_REQUEST,
      );
    }

    return { role, content };
  });
}

export const ChatbotController = {
  chat: async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== "object") {
      throw new AppError("Request body is required", status.BAD_REQUEST);
    }

    const { messages } = req.body as { messages?: unknown };
    const parsed = parseMessages(messages);

    const reply = await ChatbotService.chat(parsed);

    res.status(status.OK).json({
      success: true,
      message: "Chatbot reply generated",
      data: { reply },
    });
  },
};
