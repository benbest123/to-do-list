import express from "express";
import { authentication, fetchUsers } from "./authController";

export const authRouter = express.Router();

authRouter.get("/", fetchUsers);
authRouter.post("/login", authentication);
