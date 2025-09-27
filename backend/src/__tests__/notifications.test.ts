import request from "supertest";
import app from "../index";

describe("Notifications API", () => {
  const mockToken = "mock-jwt-token";

  describe("GET /api/notifications", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/notifications");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/notifications", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/notifications").send({
        title: "Test Notification",
        body: "Test body",
        recipient_id: "all",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/notifications")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          title: "Test Notification",
          // missing body and to
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/notifications/:id/read", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app).post(
        "/api/notifications/test-id/read"
      );

      expect(response.status).toBe(401);
    });
  });
});
