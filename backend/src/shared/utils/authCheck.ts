import { Request } from "express";
import jwt from "jsonwebtoken";

export const getUserFromToken = (req: Request): number | null => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; type?: string };

    // Reject refresh tokens being used as access tokens
    if (decoded.type && decoded.type !== "access") return null;

    return decoded.userId;
  } catch {
    return null;
  }
};
