import request from "supertest";
import jwt from "jsonwebtoken";

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
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  return { __esModule: true, default: db };
});

import db from "../../shared/database";
import { createApp } from "../../app";

const JWT_SECRET = "test-todo-secret";
const app = createApp();

// ── helpers ──────────────────────────────────────────────────────────────────
function authHeader(userId: number, username = "testuser") {
  const token = jwt.sign({ userId, username, type: "access" }, JWT_SECRET);
  return `Bearer ${token}`;
}

function seedUser(id = 1, username = "testuser"): number {
  db.prepare("INSERT OR IGNORE INTO users (id, username, password_hash) VALUES (?, ?, ?)").run(id, username, "hash");
  return id;
}

function seedTodo(userId: number, title: string, orderIndex = 1, completed = 0): number {
  const row = db
    .prepare("INSERT INTO todos (title, user_id, order_index, completed) VALUES (?, ?, ?, ?) RETURNING id")
    .get(title, userId, orderIndex, completed) as { id: number };
  return row.id;
}

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.CORS_ORIGIN = "http://localhost:5173";
});

beforeEach(() => {
  db.exec("DELETE FROM todos");
  db.exec("DELETE FROM users");
});

// ── GET /api/todos ───────────────────────────────────────────────────────────
describe("GET /api/todos", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(401);
  });

  it("returns an empty array when the user has no todos", async () => {
    const userId = seedUser();
    const res = await request(app).get("/api/todos").set("Authorization", authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns todos ordered by order_index ascending", async () => {
    const userId = seedUser();
    seedTodo(userId, "Third", 3);
    seedTodo(userId, "First", 1);
    seedTodo(userId, "Second", 2);

    const res = await request(app).get("/api/todos").set("Authorization", authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.map((t: { title: string }) => t.title)).toEqual(["First", "Second", "Third"]);
  });

  it("only returns todos belonging to the authenticated user", async () => {
    const userId1 = seedUser(1, "user1");
    const userId2 = seedUser(2, "user2");
    seedTodo(userId1, "User1 todo");
    seedTodo(userId2, "User2 todo");

    const res = await request(app).get("/api/todos").set("Authorization", authHeader(userId1, "user1"));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("User1 todo");
  });

  it("returns todos with boolean completed field", async () => {
    const userId = seedUser();
    seedTodo(userId, "Done todo", 1, 1);

    const res = await request(app).get("/api/todos").set("Authorization", authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body[0].completed).toBe(true);
  });
});

// ── POST /api/todos ──────────────────────────────────────────────────────────
describe("POST /api/todos", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).post("/api/todos").send({ title: "New todo" });
    expect(res.status).toBe(401);
  });

  it("creates a new todo and returns 201", async () => {
    const userId = seedUser();
    const res = await request(app)
      .post("/api/todos")
      .set("Authorization", authHeader(userId))
      .send({ title: "My new todo" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("My new todo");
    expect(res.body.completed).toBe(false);
    expect(res.body.user_id).toBe(userId);
  });

  it("returns 400 when title is missing", async () => {
    const userId = seedUser();
    const res = await request(app).post("/api/todos").set("Authorization", authHeader(userId)).send({});

    expect(res.status).toBe(400);
  });

  it("assigns an incrementing order_index", async () => {
    const userId = seedUser();
    await request(app).post("/api/todos").set("Authorization", authHeader(userId)).send({ title: "First" });

    const res = await request(app)
      .post("/api/todos")
      .set("Authorization", authHeader(userId))
      .send({ title: "Second" });

    expect(res.body.order_index).toBe(2);
  });
});

// ── PATCH /api/todos/:id/toggle ──────────────────────────────────────────────
describe("PATCH /api/todos/:id/toggle", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).patch("/api/todos/1/toggle");
    expect(res.status).toBe(401);
  });

  it("toggles a todo from incomplete to complete", async () => {
    const userId = seedUser();
    const todoId = seedTodo(userId, "Toggle me", 1, 0);

    const res = await request(app).patch(`/api/todos/${todoId}/toggle`).set("Authorization", authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("toggles a todo from complete back to incomplete", async () => {
    const userId = seedUser();
    const todoId = seedTodo(userId, "Toggle me", 1, 1);

    const res = await request(app).patch(`/api/todos/${todoId}/toggle`).set("Authorization", authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it("returns 400 for a non-numeric id", async () => {
    const userId = seedUser();
    const res = await request(app).patch("/api/todos/abc/toggle").set("Authorization", authHeader(userId));

    expect(res.status).toBe(400);
  });

  it("returns 404 when the todo does not belong to the user", async () => {
    const userId1 = seedUser(1, "user1");
    const userId2 = seedUser(2, "user2");
    const todoId = seedTodo(userId2, "Other user todo");

    const res = await request(app)
      .patch(`/api/todos/${todoId}/toggle`)
      .set("Authorization", authHeader(userId1, "user1"));

    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/todos/:id/edit ────────────────────────────────────────────────
describe("PATCH /api/todos/:id/edit", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).patch("/api/todos/1/edit").send({ title: "Updated" });
    expect(res.status).toBe(401);
  });

  it("updates the title and returns 204", async () => {
    const userId = seedUser();
    const todoId = seedTodo(userId, "Original title");

    const res = await request(app)
      .patch(`/api/todos/${todoId}/edit`)
      .set("Authorization", authHeader(userId))
      .send({ title: "Updated title" });

    expect(res.status).toBe(204);

    const row = db.prepare("SELECT title FROM todos WHERE id = ?").get(todoId) as { title: string };
    expect(row.title).toBe("Updated title");
  });

  it("returns 400 when title is empty", async () => {
    const userId = seedUser();
    const todoId = seedTodo(userId, "Original title");

    const res = await request(app)
      .patch(`/api/todos/${todoId}/edit`)
      .set("Authorization", authHeader(userId))
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the todo does not belong to the user", async () => {
    const userId1 = seedUser(1, "user1");
    const userId2 = seedUser(2, "user2");
    const todoId = seedTodo(userId2, "Other user todo");

    const res = await request(app)
      .patch(`/api/todos/${todoId}/edit`)
      .set("Authorization", authHeader(userId1, "user1"))
      .send({ title: "Hack" });

    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/todos/reorder ─────────────────────────────────────────────────
describe("PATCH /api/todos/reorder", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).patch("/api/todos/reorder").send({ todos: [] });
    expect(res.status).toBe(401);
  });

  it("reorders todos successfully", async () => {
    const userId = seedUser();
    const id1 = seedTodo(userId, "A", 1);
    const id2 = seedTodo(userId, "B", 2);

    const res = await request(app)
      .patch("/api/todos/reorder")
      .set("Authorization", authHeader(userId))
      .send({
        todos: [
          { id: id1, order_index: 2 },
          { id: id2, order_index: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reordered/i);

    const rows = db.prepare("SELECT id, order_index FROM todos ORDER BY order_index ASC").all() as {
      id: number;
      order_index: number;
    }[];
    expect(rows[0].id).toBe(id2);
    expect(rows[1].id).toBe(id1);
  });

  it("returns 400 when todos is not an array", async () => {
    const userId = seedUser();
    const res = await request(app)
      .patch("/api/todos/reorder")
      .set("Authorization", authHeader(userId))
      .send({ todos: "not-an-array" });

    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/todos/delete-completed ───────────────────────────────────────
describe("DELETE /api/todos/delete-completed", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).delete("/api/todos/delete-completed");
    expect(res.status).toBe(401);
  });

  it("deletes all completed todos for the user", async () => {
    const userId = seedUser();
    seedTodo(userId, "Done 1", 1, 1);
    seedTodo(userId, "Done 2", 2, 1);
    seedTodo(userId, "Not done", 3, 0);

    const res = await request(app).delete("/api/todos/delete-completed").set("Authorization", authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.deletedCount).toBe(2);

    const remaining = db.prepare("SELECT * FROM todos WHERE user_id = ?").all(userId);
    expect(remaining).toHaveLength(1);
  });

  it("only deletes the authenticated user's completed todos", async () => {
    const userId1 = seedUser(1, "user1");
    const userId2 = seedUser(2, "user2");
    seedTodo(userId2, "User2 done", 1, 1);

    const res = await request(app)
      .delete("/api/todos/delete-completed")
      .set("Authorization", authHeader(userId1, "user1"));

    expect(res.status).toBe(200);
    expect(res.body.deletedCount).toBe(0);

    const user2Todos = db.prepare("SELECT * FROM todos WHERE user_id = ?").all(userId2);
    expect(user2Todos).toHaveLength(1);
  });
});

// ── DELETE /api/todos/:id ─────────────────────────────────────────────────────
describe("DELETE /api/todos/:id", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).delete("/api/todos/1");
    expect(res.status).toBe(401);
  });

  it("deletes the todo and returns 204", async () => {
    const userId = seedUser();
    const todoId = seedTodo(userId, "Delete me");

    const res = await request(app).delete(`/api/todos/${todoId}`).set("Authorization", authHeader(userId));

    expect(res.status).toBe(204);

    const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(todoId);
    expect(row).toBeUndefined();
  });

  it("returns 400 for a non-numeric id", async () => {
    const userId = seedUser();
    const res = await request(app).delete("/api/todos/not-a-number").set("Authorization", authHeader(userId));

    expect(res.status).toBe(400);
  });

  it("returns 404 when the todo does not exist or belongs to another user", async () => {
    const userId1 = seedUser(1, "user1");
    const userId2 = seedUser(2, "user2");
    const todoId = seedTodo(userId2, "Other todo");

    const res = await request(app).delete(`/api/todos/${todoId}`).set("Authorization", authHeader(userId1, "user1"));

    expect(res.status).toBe(404);
  });
});
