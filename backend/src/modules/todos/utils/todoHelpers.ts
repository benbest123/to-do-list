import { getUserFromToken } from "../../../shared/utils/authCheck";
import { Request, Response } from "express";

export const checkUserId = (req: Request, res: Response): number => {
  const userId = getUserFromToken(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    throw new Error("Authentication required");
  }

  return userId;
};

export const checkTodoId = (id: string, res: Response) => {
  if (!id || isNaN(Number(id))) {
    // this is to prevent possible sql injection
    return res.status(400).json({ error: "Invalid todo ID" });
  }
};
