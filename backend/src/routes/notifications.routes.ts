import { Router } from "express";
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
} from "../controllers/notifications.controller";
import {
  authMiddleware,
  teacherMiddleware,
} from "../middleware/auth.middleware";
import { generalRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Apply rate limiting to all routes
router.use(generalRateLimit);

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get("/", getNotifications);
router.post("/", teacherMiddleware, createNotification);
router.post("/:id/read", markNotificationAsRead);

export default router;
