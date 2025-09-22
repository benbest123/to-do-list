import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRouter } from "./modules/auth/authRouter";
import { todoRouter } from "./modules/todos/todoRouter";
import { spotifyRouter } from "./modules/spotify/router";
dotenv.config();

export const createApp = () => {
  const app = express();

  //config
  app.use(express.json());
  app.use(cors());

  //routing
  app.use("/api/auth", authRouter);
  app.use("/api/todos", todoRouter);
  app.use("/api/spotify", spotifyRouter);

  return app;
};
