import express from "express";
import { authentication, logoutUser, refreshAccessToken } from "./authController";

export const authRouter = express.Router();

authRouter.post("/login", authentication);
authRouter.post("/refresh", refreshAccessToken);
authRouter.post("/logout", logoutUser);
