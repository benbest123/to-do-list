import { Request, Response } from "express";
import db from "../database";
import { Todo } from "../types/todo";

export const fetchTodos = (req: Request, res: Response) => {
  try {
    const todos = db.prepare("SELECT * FROM todos").all();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch todos" });
  }
};

export const addTodo = (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json("cannot submit an empty todo");
    }

    const newTodo = db.prepare("INSERT INTO todos (title) values (?) RETURNING *").get(title);

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
    const result = db.prepare("UPDATE todos SET completed = NOT completed WHERE id = ? RETURNING *").get(id) as Todo;

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
