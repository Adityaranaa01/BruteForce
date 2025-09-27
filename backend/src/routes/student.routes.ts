import { Router } from "express";
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware";
import Joi from "joi";

const router = Router();

// Validation schemas
const usnSchema = Joi.object({
  usn: Joi.string().min(3).max(20).required(),
});

const createStudentSchema = Joi.object({
  usn: Joi.string().min(3).max(20).required(),
  branch: Joi.string().min(2).max(50).required(),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(10).max(15).optional(),
  email: Joi.string().email().optional(),
  year: Joi.number().integer().min(1).max(4).required(),
  sem: Joi.number().integer().min(1).max(8).required(),
});

const updateStudentSchema = Joi.object({
  branch: Joi.string().min(2).max(50).optional(),
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().min(10).max(15).optional(),
  email: Joi.string().email().optional(),
  year: Joi.number().integer().min(1).max(4).optional(),
  sem: Joi.number().integer().min(1).max(8).optional(),
});

// Routes
router.get("/", getStudents);
router.get("/:usn", validateParams(usnSchema), getStudent);
router.post("/", validateBody(createStudentSchema), createStudent);
router.put(
  "/:usn",
  validateParams(usnSchema),
  validateBody(updateStudentSchema),
  updateStudent
);
router.delete("/:usn", validateParams(usnSchema), deleteStudent);

export default router;
