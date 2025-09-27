import { Router } from "express";
import {
  getTimetable,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "../controllers/timetable.controller";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware";
import Joi from "joi";

const router = Router();

// Validation schemas
const timetableIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const createTimetableSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  teacher_id: Joi.number().integer().positive().required(),
  day_of_week: Joi.string()
    .valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
    .required(),
  time_slot: Joi.string().min(1).max(50).required(),
  room_no: Joi.string().min(1).max(20).optional(),
});

const updateTimetableSchema = Joi.object({
  course_id: Joi.number().integer().positive().optional(),
  teacher_id: Joi.number().integer().positive().optional(),
  day_of_week: Joi.string()
    .valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
    .optional(),
  time_slot: Joi.string().min(1).max(50).optional(),
  room_no: Joi.string().min(1).max(20).optional(),
});

// Routes
router.get("/", getTimetable);
router.get("/:id", validateParams(timetableIdSchema), getTimetableById);
router.post("/", validateBody(createTimetableSchema), createTimetable);
router.put(
  "/:id",
  validateParams(timetableIdSchema),
  validateBody(updateTimetableSchema),
  updateTimetable
);
router.delete("/:id", validateParams(timetableIdSchema), deleteTimetable);

export default router;
