import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { JwtPayload } from "./jwt.service";

class SocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.socket.origin,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Authenticate user
      socket.on("authenticate", (token: string) => {
        try {
          const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

          // Join user-specific room
          socket.join(`user:${payload.userId}`);

          // Join role-based room
          socket.join(`role:${payload.role}`);

          socket.emit("authenticated", {
            userId: payload.userId,
            role: payload.role,
          });
        } catch (error) {
          socket.emit("auth_error", { message: "Invalid token" });
          socket.disconnect();
        }
      });

      // Handle presence updates
      socket.on("presence", (data: { token: string; classId?: string }) => {
        try {
          const payload = jwt.verify(
            data.token,
            config.jwt.secret
          ) as JwtPayload;

          // Join class room if classId provided
          if (data.classId) {
            socket.join(`class:${data.classId}`);
          }

          socket.emit("presence_acknowledged");
        } catch (error) {
          socket.emit("presence_error", { message: "Invalid token" });
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToRole(role: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
    }
  }

  emitToClass(classId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`class:${classId}`).emit(event, data);
    }
  }

  emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitEngagementUpdate(classId: string, score: number): void {
    this.emitToClass(classId, "engagement_update", {
      classId,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  emitAIAlert(userId: string, message: string): void {
    this.emitToUser(userId, "ai_alert", {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const SocketService = new SocketService();
