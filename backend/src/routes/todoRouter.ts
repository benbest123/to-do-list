import express from "express";
import { addTodo, deleteCompleted, deleteTodo, fetchTodos, toggleComplete } from "../controllers/todoController";

export const todoRouter = express.Router();

todoRouter.get("/", fetchTodos);
todoRouter.post("/", addTodo);
todoRouter.patch("/:id/toggle", toggleComplete);
todoRouter.delete("/delete-completed", deleteCompleted);
todoRouter.delete("/:id", deleteTodo);
