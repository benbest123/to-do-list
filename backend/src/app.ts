import cors from "cors";
import express from "express";
import { todoRouter } from "./routes/todoRouter";

export const createApp = () => {
  const app = express();

  //config
  app.use(express.json());
  app.use(cors());

  //routing
  app.use("/todos", todoRouter);

  return app;
};
