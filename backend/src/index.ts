import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { config } from "./config";
import { SocketService } from "./services/socket.service";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Import routes
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import courseRoutes from "./routes/course.routes";
import attendanceRoutes from "./routes/attendance.routes";
import timetableRoutes from "./routes/timetable.routes";

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
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);

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
