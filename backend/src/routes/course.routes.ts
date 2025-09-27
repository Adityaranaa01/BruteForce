import { Router } from "express";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware";
import Joi from "joi";

const router = Router();

// Validation schemas
const courseIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const createCourseSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  credits: Joi.number().integer().min(1).max(10).required(),
});

const updateCourseSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  credits: Joi.number().integer().min(1).max(10).optional(),
});

// Routes
router.get("/", getCourses);
router.get("/:id", validateParams(courseIdSchema), getCourse);
router.post("/", validateBody(createCourseSchema), createCourse);
router.put(
  "/:id",
  validateParams(courseIdSchema),
  validateBody(updateCourseSchema),
  updateCourse
);
router.delete("/:id", validateParams(courseIdSchema), deleteCourse);

export default router;
