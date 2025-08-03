import { Request, Response } from "express";
import db from "../database";
import { Todo } from "../types/todo";
import { TodoRow } from "../types/todorow";
import { getUserFromToken } from "../utils/authCheck";
import { dbToTodo } from "../utils/database";

export const fetchTodos = (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId)
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
    const todoRows = db.prepare("SELECT * FROM todos").all(userId) as TodoRow[];
    const todos: Todo[] = todoRows.map(dbToTodo);
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch todos" });
  }
};

export const fetchAllTodos = (req: Request, res: Response) => {
  try {
    const todoRows = db.prepare("SELECT * FROM todos").all() as TodoRow[];
    const todos: Todo[] = todoRows.map(dbToTodo);
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch todos" });
  }
};

export const addTodo = (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { title } = req.body;

    if (!title) {
      return res.status(400).json("cannot submit an empty todo");
    }

    const newTodoRow = db.prepare("INSERT INTO todos (title, user_id) values (?, ?) RETURNING *").get(title, userId) as TodoRow;
    const newTodo = dbToTodo(newTodoRow);

    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "failed to create todo" });
  }
};

export const toggleComplete = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      // this is to prevent possible sql injection
      return res.status(400).json({ error: "Invalid todo ID" });
    }
    const resultRow = db.prepare("UPDATE todos SET completed = NOT completed WHERE id = ? RETURNING *").get(id) as TodoRow;
    const result = dbToTodo(resultRow);

    if (!result) {
      return res.status(404).json({ error: "todo not found" });
    }

    res.json({ ...result, completed: Boolean(result.completed) });
  } catch (err) {
    res.status(500).json({ error: "failed to update todo" });
  }
};

export const deleteCompleted = (req: Request, res: Response) => {
  try {
    const result = db.prepare("DELETE FROM todos where completed = 1").run();

    res.json({ deletedCount: result.changes });
  } catch (err) {
    res.status(500).json({ error: "failed to delete todos" });
  }
};

export const deleteTodo = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      // this is to prevent possible sql injection
      return res.status(400).json({ error: "Invalid todo ID" });
    }
    const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "todo not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "failed to delete todo" });
  }
};
