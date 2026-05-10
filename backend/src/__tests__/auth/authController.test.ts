import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ── must mock before importing the app ──────────────────────────────────────
jest.mock("../../shared/database", () => {
  const Database = require("better-sqlite3");
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return { __esModule: true, default: db };
});

import db from "../../shared/database";
import { createApp } from "../../app";

const JWT_SECRET = "test-auth-secret";
const app = createApp();

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.CORS_ORIGIN = "http://localhost:5173";
});

beforeEach(() => {
  db.exec("DELETE FROM users");
});

// ── helpers ──────────────────────────────────────────────────────────────────
function makeRefreshToken(userId: number, username: string) {
  return jwt.sign({ userId, username, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  describe("input validation", () => {
    it("returns 400 when username is missing", async () => {
      const res = await request(app).post("/api/auth/login").send({ password: "secret" });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/username and password are required/i);
    });

    it("returns 400 when password is missing", async () => {
      const res = await request(app).post("/api/auth/login").send({ username: "alice" });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/username and password are required/i);
    });

    it("returns 400 when both fields are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("registration (new user)", () => {
    it("creates a new user and returns 201 with token", async () => {
      const res = await request(app).post("/api/auth/login").send({ username: "newuser", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe("newuser");
      expect(res.body.message).toMatch(/user created/i);
    });

    it("sets an httpOnly refresh_token cookie on registration", async () => {
      const res = await request(app).post("/api/auth/login").send({ username: "cookieuser", password: "password123" });

      expect(res.headers["set-cookie"]).toBeDefined();
      const cookies = [res.headers["set-cookie"]].flat().filter(Boolean) as string[];
      expect(cookies.some(c => c.startsWith("refresh_token="))).toBe(true);
      expect(cookies.some(c => c.includes("HttpOnly"))).toBe(true);
    });

    it("returns 400 when password is shorter than 6 characters for a new user", async () => {
      const res = await request(app).post("/api/auth/login").send({ username: "shortpass", password: "12345" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 6 characters/i);
    });

    it("does not expose password_hash in the response", async () => {
      const res = await request(app).post("/api/auth/login").send({ username: "safeuser", password: "password123" });

      expect(res.body.user.password_hash).toBeUndefined();
    });
  });

  describe("login (existing user)", () => {
    beforeEach(() => {
      const hash = bcrypt.hashSync("correct-password", 10);
      db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("existinguser", hash);
    });

    it("returns 200 with a token on correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "existinguser", password: "correct-password" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toMatch(/login successful/i);
    });

    it("returns 400 on incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "existinguser", password: "wrong-password" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/username or password is incorrect/i);
    });

    it("returns a JWT token that contains the correct userId", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "existinguser", password: "correct-password" });

      const decoded = jwt.verify(res.body.token, JWT_SECRET) as { userId: number; username: string };
      expect(decoded.username).toBe("existinguser");
      expect(typeof decoded.userId).toBe("number");
    });
  });
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────
describe("POST /api/auth/refresh", () => {
  it("returns a new access token when a valid refresh cookie is present", async () => {
    const refreshToken = makeRefreshToken(1, "alice");

    const res = await request(app).post("/api/auth/refresh").set("Cookie", `refresh_token=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.username).toBe("alice");
  });

  it("returns 401 when no refresh cookie is present", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/no refresh token/i);
  });

  it("returns 401 when the refresh token is invalid", async () => {
    const res = await request(app).post("/api/auth/refresh").set("Cookie", "refresh_token=invalid.token.here");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it("returns 401 when an access token is used instead of a refresh token", async () => {
    const accessToken = jwt.sign({ userId: 1, username: "alice", type: "access" }, JWT_SECRET);
    const res = await request(app).post("/api/auth/refresh").set("Cookie", `refresh_token=${accessToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid token type/i);
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
describe("POST /api/auth/logout", () => {
  it("returns 200 and clears the refresh_token cookie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);

    // Cookie should be cleared (max-age=0 or expires in the past)
    const cookies = [res.headers["set-cookie"]].flat().filter(Boolean) as string[];
    const refreshCookie = cookies.find(c => c.startsWith("refresh_token="));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/Max-Age=0|Expires=/i);
  });
});
