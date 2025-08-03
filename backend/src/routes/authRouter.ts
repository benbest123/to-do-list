import express from "express";
import { authentication, fetchUsers } from "../controllers/authController";

export const authRouter = express.Router();

authRouter.get("/", fetchUsers);
authRouter.post("/login", authentication);
