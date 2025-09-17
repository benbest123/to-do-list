import { Request, Response } from "express";
import db from "../../shared/database";
import { Todo } from "../../shared/types/todo";
import { TodoRow } from "../../shared/types/todorow";
import { getUserFromToken } from "../../shared/utils/authCheck";
import { dbToTodo } from "../../shared/utils/database";

export const fetchTodos = (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const todoRows = db.prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY order_index ASC").all(userId) as TodoRow[];
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

    // Get the highest order_index for this user's todos and add 1
    const maxOrderRow = db.prepare("SELECT MAX(order_index) as max_order FROM todos WHERE user_id = ?").get(userId) as { max_order: number | null };
    const nextOrder = (maxOrderRow?.max_order || 0) + 1;

    const newTodoRow = db.prepare("INSERT INTO todos (title, user_id, order_index) values (?, ?, ?) RETURNING *").get(title, userId, nextOrder) as TodoRow;
    const newTodo = dbToTodo(newTodoRow);

    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "failed to create todo" });
  }
};

export const reorderTodos = (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { todos } = req.body;

    if (!Array.isArray(todos)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    // Use a transaction to ensure all updates happen atomically
    const updateStmt = db.prepare("UPDATE todos SET order_index = ? WHERE id = ? AND user_id = ?");
    const updateMany = db.transaction((todoUpdates: { id: number; order_index: number }[]) => {
      for (const update of todoUpdates) {
        updateStmt.run(update.order_index, update.id, userId);
      }
    });

    updateMany(todos);

    res.json({ message: "Todos reordered successfully" });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ error: "Failed to reorder todos" });
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
