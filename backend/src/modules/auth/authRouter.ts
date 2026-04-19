import express from "express";
import { authentication } from "./authController";

export const authRouter = express.Router();

authRouter.post("/login", authentication);
