import express from "express";
import {
  addTodo,
  deleteCompleted,
  deleteTodo,
  editTodo,
  fetchTodos,
  reorderTodos,
  toggleComplete,
} from "./todoController";

export const todoRouter = express.Router();

todoRouter.get("/", fetchTodos);
todoRouter.post("/", addTodo);
todoRouter.patch("/:id/toggle", toggleComplete);
todoRouter.patch("/reorder", reorderTodos);
todoRouter.patch("/:id/edit", editTodo);
todoRouter.delete("/delete-completed", deleteCompleted);
todoRouter.delete("/:id", deleteTodo);
