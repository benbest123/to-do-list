import express from "express";
import { addTodo, deleteCompleted, deleteTodo, fetchAllTodos, fetchTodos, reorderTodos, toggleComplete } from "./todoController";

export const todoRouter = express.Router();

todoRouter.get("/", fetchTodos);
todoRouter.get("/all", fetchAllTodos);
todoRouter.post("/", addTodo);
todoRouter.patch("/:id/toggle", toggleComplete);
todoRouter.patch("/reorder", reorderTodos);
todoRouter.delete("/delete-completed", deleteCompleted);
todoRouter.delete("/:id", deleteTodo);
