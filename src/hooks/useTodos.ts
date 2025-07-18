import { useEffect, useState } from "react";
import { Todo } from "../types/todo";
import { API_URL } from "../utils/constants";

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const response = await fetch(`${API_URL}/todos`, { method: "GET" });
    if (!response.ok) {
      throw new Error("failed to fetch todos");
    }
    const data = await response.json();
    setTodos(data);
  }

  async function setTodoCompleted(id: number, checked: boolean) {
    try {
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: checked } : todo)));

      const response = await fetch(`${API_URL}/todos/${id}/toggle`, { method: "PATCH" });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      // Ssync with server
      const updatedTodo = await response.json();
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      console.error("uupdate error:", err);
      await fetchTodos();
    }
  }

  async function deleteTodo(id: number) {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((prev) => prev.filter((todo: Todo) => todo.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      await fetchTodos();
    }
  }

  async function deleteAllCompletedTodos() {
    try {
      //optimistic update
      setTodos((prev) => prev.filter((todo: Todo) => !todo.completed));
      const response = await fetch(`${API_URL}/todos/delete-completed`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete todos");
      }

      // Optional: Get count from response
      const { deletedCount } = await response.json();
      console.log(`Deleted ${deletedCount} todos`);
    } catch (err) {
      console.error("Delete error:", err);
      await fetchTodos();
    }
  }

  return {
    todos,
    fetchTodos,
    setTodoCompleted,
    deleteAllCompletedTodos,
    deleteTodo,
  };
}
