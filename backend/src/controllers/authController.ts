import { Request, Response } from "express";
import db from "../database";

export const fetchUsers = (req: Request, res: Response) => {
  try {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch users" });
  }
};
