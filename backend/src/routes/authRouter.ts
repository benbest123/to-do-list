import express from "express";
import { fetchUsers, logIn, newUser } from "../controllers/authController";

export const authRouter = express.Router();

authRouter.get("/", fetchUsers);
authRouter.post("/register", newUser);
authRouter.post("/login", logIn);
