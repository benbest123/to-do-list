import cors from "cors";
import express from "express";
import { authRouter } from "./modules/auth/authRouter";
import { spotifyRouter } from "./modules/spotify/spotifyRouter";
import { todoRouter } from "./modules/todos/todoRouter";

export const createApp = () => {
  const app = express();

  //config
  app.use(express.json());
  app.use(
    cors({
      origin: "http://127.0.0.1:5173",
      credentials: true,
    })
  );
  //routing
  app.use("/api/auth", authRouter);
  app.use("/api/todos", todoRouter);
  app.use("/api/spotify", spotifyRouter);

  return app;
};
