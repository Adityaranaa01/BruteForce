import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { config } from "./config";
import { SocketService } from "./services/socket.service";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import notificationsRoutes from "./routes/notifications.routes";
import aiRoutes from "./routes/ai.routes";
import scheduleRoutes from "./routes/schedule.routes";
import predictiveRoutes from "./routes/predictive.routes";
import attendanceRoutes from "./routes/attendance.routes";

const app = express();
const server = createServer(app);

// Initialize Socket.IO
SocketService.initialize(server);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.socket.origin,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Campus Digitization Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/predictive", predictiveRoutes);
app.use("/api/attendance", attendanceRoutes);

// Recommendations route (simple implementation)
app.get("/api/recommendations", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const { RecommendationService } = await import(
      "@/services/recommendation.service"
    );
    const recommendations = await RecommendationService.generateRecommendations(
      userId as string
    );

    res.json({
      status: "success",
      data: {
        recommendations,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch recommendations",
    });
  }
});

// Recommendations feedback route
app.post("/api/recommendations/:id/feedback", async (req, res) => {
  try {
    const { id } = req.params;
    const { useful } = req.body;

    if (typeof useful !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "Useful field must be a boolean",
      });
    }

    const { RecommendationService } = await import(
      "@/services/recommendation.service"
    );
    await RecommendationService.recordFeedback(id, useful);

    res.json({
      status: "success",
      message: "Feedback recorded successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to record feedback",
    });
  }
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;

server.listen(PORT, () => {
  console.log(`🚀 Campus Digitization Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.IO enabled for real-time features`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

export default app;
