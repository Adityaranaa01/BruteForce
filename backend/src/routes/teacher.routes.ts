import { Router } from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware";
import Joi from "joi";

const router = Router();

// Validation schemas
const teacherIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const createTeacherSchema = Joi.object({
  branch: Joi.string().min(2).max(50).required(),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(10).max(15).optional(),
  email: Joi.string().email().optional(),
});

const updateTeacherSchema = Joi.object({
  branch: Joi.string().min(2).max(50).optional(),
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().min(10).max(15).optional(),
  email: Joi.string().email().optional(),
});

// Routes
router.get("/", getTeachers);
router.get("/:id", validateParams(teacherIdSchema), getTeacher);
router.post("/", validateBody(createTeacherSchema), createTeacher);
router.put(
  "/:id",
  validateParams(teacherIdSchema),
  validateBody(updateTeacherSchema),
  updateTeacher
);
router.delete("/:id", validateParams(teacherIdSchema), deleteTeacher);

export default router;
