import { Router } from "express";
import {
  getAttendance,
  createAttendance,
  createBulkAttendance,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.controller";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware";
import Joi from "joi";

const router = Router();

// Validation schemas
const attendanceIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const createAttendanceSchema = Joi.object({
  usn: Joi.string().min(3).max(20).required(),
  course_id: Joi.number().integer().positive().required(),
  date: Joi.string().isoDate().optional(),
  status: Joi.string().valid("Present", "Absent", "Late").required(),
});

const bulkAttendanceSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  date: Joi.string().isoDate().required(),
  students: Joi.array()
    .items(
      Joi.object({
        usn: Joi.string().min(3).max(20).required(),
        status: Joi.string().valid("Present", "Absent", "Late").required(),
      })
    )
    .min(1)
    .required(),
});

const updateAttendanceSchema = Joi.object({
  status: Joi.string().valid("Present", "Absent", "Late").required(),
});

// Routes
router.get("/", getAttendance);
router.get("/stats", getAttendanceStats);
router.post("/", validateBody(createAttendanceSchema), createAttendance);
router.post("/bulk", validateBody(bulkAttendanceSchema), createBulkAttendance);
router.put(
  "/:id",
  validateParams(attendanceIdSchema),
  validateBody(updateAttendanceSchema),
  updateAttendance
);
router.delete("/:id", validateParams(attendanceIdSchema), deleteAttendance);

export default router;
