import { Router } from "express";
import {
  chat,
  getConversations,
  summarizeLecture,
  getLectureSummary,
} from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { aiRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.post("/chat", aiRateLimit, chat);
router.get("/conversations", getConversations);
router.post("/lectures/:id/summarize", aiRateLimit, summarizeLecture);
router.get("/lectures/:id/summary", getLectureSummary);

export default router;
