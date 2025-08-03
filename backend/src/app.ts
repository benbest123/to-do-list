import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRouter } from "./routes/authRouter";
import { todoRouter } from "./routes/todoRouter";
dotenv.config();

export const createApp = () => {
  const app = express();

  //config
  app.use(express.json());
  app.use(cors());

  //routing
  app.use("/api/todos", todoRouter);
  app.use("/api/auth", authRouter);

  return app;
};
