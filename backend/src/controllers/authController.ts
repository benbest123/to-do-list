import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../database";
import { User } from "../types/user";

const JWT_SECRET = process.env.JWT_SECRET;

export const fetchUsers = (req: Request, res: Response) => {
  try {
    const users = db.prepare("SELECT * FROM users").all() as Omit<User, "password_hash">[]; // dont want to return password hash
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch users" });
  }
};

export const newUser = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // very basic input validation
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at").get(username, hashedPassword) as Omit<User, "password_hash">;

    res.status(201).json(newUser);
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ error: "Username already exists" });
    }
    throw err;
  }
};

export const logIn = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    if (!user) {
      return res.status(400).json({ error: "username or password is incorrect" });
    }

    if (!bcrypt.compareSync(password, user.password_hashed)) {
      return res.status(400).json({ error: "username or password is incorrect" });
    }

    // generate JWT token
    if (!JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const userResponse = {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
    };

    res.json({ user: userResponse, token: token });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};
