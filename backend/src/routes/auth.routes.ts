import { Router } from "express";
import { login, register, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Public routes (with rate limiting)
router.post("/login", authRateLimit, login);
router.post("/register", authRateLimit, register);

// Protected routes
router.get("/me", authMiddleware, getMe);

export default router;
