import request from "supertest";
import app from "../index";

describe("Authentication API", () => {
  describe("POST /api/auth/login", () => {
    it("should return 400 for missing credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        // missing password and role
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
    });
  });
});
