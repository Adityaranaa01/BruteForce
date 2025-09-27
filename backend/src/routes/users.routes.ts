import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { generalRateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Apply rate limiting to all routes
router.use(generalRateLimit);

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get("/", adminMiddleware, getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", adminMiddleware, deleteUser);

export default router;
