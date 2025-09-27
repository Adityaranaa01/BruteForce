import { Router } from "express";
import {
  receiveAttendanceEvent,
  getAttendanceStats,
} from "../controllers/attendance.controller";
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
router.post("/events", teacherMiddleware, receiveAttendanceEvent);
router.get("/stats", getAttendanceStats);

export default router;
