import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../shared/database";
import { User } from "../../shared/types/user";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signAccessToken(userId: number, username: string) {
  return jwt.sign({ userId, username, type: "access" }, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

function signRefreshToken(userId: number, username: string) {
  return jwt.sign({ userId, username, type: "refresh" }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export const authentication = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // very basic input validation
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Check if user already exists
    const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;

    let user: User;
    let isNewUser = false;

    if (existingUser) {
      // log in logic
      if (!bcrypt.compareSync(password, existingUser.password_hash)) {
        return res.status(400).json({ error: "username or password is incorrect" });
      }
      user = existingUser;
    } else {
      // registration logic
      if (password.length < 6) {
        return res.status(400).json({ error: "password must be at least 6 characters" });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = db
        .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING *")
        .get(username, hashedPassword) as User;
      user = newUser;
      isNewUser = true;
    }

    const accessToken = signAccessToken(user.id, user.username);
    const refreshToken = signRefreshToken(user.id, user.username);

    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);

    res.status(isNewUser ? 201 : 200).json({
      user: { id: user.id, username: user.username, created_at: user.created_at },
      token: accessToken,
      message: isNewUser ? "user created and logged in" : "login successful",
    });
  } catch (err: any) {
    console.error("Authentication error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const refreshAccessToken = (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; username: string; type: string };

    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    const accessToken = signAccessToken(decoded.userId, decoded.username);
    res.json({ token: accessToken, username: decoded.username });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  res.json({ message: "Logged out" });
};
