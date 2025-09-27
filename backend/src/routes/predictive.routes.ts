import { Router } from "express";
import {
  assessStudentRisk,
  getStudentInsights,
  getInterventions,
  createIntervention,
  updateIntervention,
} from "../controllers/predictive.controller";
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
router.post("/assess", teacherMiddleware, assessStudentRisk);
router.get("/insights/:userId", getStudentInsights);
router.get("/interventions", getInterventions);
router.post("/interventions", teacherMiddleware, createIntervention);
router.put("/interventions/:id", updateIntervention);

export default router;
