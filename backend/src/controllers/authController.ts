import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../database";
import { User } from "../types/user";

export const fetchUsers = (req: Request, res: Response) => {
  try {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    const usersNoPassword = users.map(({ password_hash, ...rest }) => rest) as Omit<User, "password_hash">[]; // dont want to return password hash
    res.json(usersNoPassword);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch users" });
  }
};

export const authentication = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // very basic input validation
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    // check JWT token
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
      const newUser = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING *").get(username, hashedPassword) as User;

      user = newUser;
      isNewUser = true;
    }

    // generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const userResponse = {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
    };

    const statusCode = isNewUser ? 201 : 200;

    res.status(statusCode).json({
      user: userResponse,
      token: token,
      message: isNewUser ? "user created and logged in" : "login successful",
    });
  } catch (err: any) {
    console.error("Authentication error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};
