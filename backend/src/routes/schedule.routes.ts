import { Router } from "express";
import {
  getSchedules,
  createSchedule,
  optimizeSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller";
import {
  authMiddleware,
  adminMiddleware,
  teacherMiddleware,
} from "../middleware/auth.middleware";
import { generalRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Apply rate limiting to all routes
router.use(generalRateLimit);

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get("/", getSchedules);
router.post("/", teacherMiddleware, createSchedule);
router.post("/optimize", adminMiddleware, optimizeSchedule);
router.get("/:id", getScheduleById);
router.put("/:id", teacherMiddleware, updateSchedule);
router.delete("/:id", adminMiddleware, deleteSchedule);

export default router;
