import express from "express";
import { spotifyGetToken, spotifyLogin, spotifyRefreshToken, spotifyUserData } from "./spotifyController";

export const spotifyRouter = express.Router();

spotifyRouter.get("/login", spotifyLogin);
spotifyRouter.get("/callback", spotifyGetToken);
spotifyRouter.post("/refresh", spotifyRefreshToken);
spotifyRouter.get("/me", spotifyUserData);
