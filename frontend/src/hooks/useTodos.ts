import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { Todo } from "../types/todo";
import { API_URL } from "../utils/constants";

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const response = await fetch(`${API_URL}/todos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("failed to fetch todos");
    }
    const data = await response.json();
    setTodos(data);
  }

  async function addTodo(title: string) {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      const newTodo = await response.json();
      setTodos(prev => [...prev, newTodo]);
    } catch (err) {
      console.error("[useTodos] addTodo failed:", err);
      setError("Failed to add todo. Please try again.");
      fetchTodos();
    }
  }

  async function setTodoCompleted(id: number, checked: boolean) {
    try {
      setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, completed: checked } : todo)));

      const response = await fetch(`${API_URL}/todos/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      // Ssync with server
      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      console.error("[useTodos] setTodoCompleted failed:", err);
      setError("Failed to update todo. Please try again.");
      fetchTodos();
    }
  }

  async function deleteTodo(id: number) {
    try {
      setTodos(prev => prev.filter((todo: Todo) => todo.id !== id));

      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }
    } catch (err) {
      console.error("[useTodos] deleteTodo failed:", err);
      setError("Failed to delete todo. Please try again.");
      fetchTodos();
    }
  }

  async function deleteAllCompletedTodos() {
    try {
      //optimistic update
      setTodos(prev => prev.filter((todo: Todo) => !todo.completed));

      const response = await fetch(`${API_URL}/todos/delete-completed`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete todos");
      }

      // Optional: Get count from response
      const { deletedCount } = await response.json();
      console.log(`Deleted ${deletedCount} todos`);
    } catch (err) {
      console.error("[useTodos] deleteAllCompletedTodos failed:", err);
      setError("Failed to delete completed todos. Please try again.");
      fetchTodos();
    }
  }

  async function reorderTodos(reorderedTodos: Todo[]) {
    try {
      // Optimistically update local state
      setTodos(reorderedTodos);

      // Send the updated order to the backend

      const orderUpdates = reorderedTodos.map(todo => ({
        id: todo.id,
        order_index: todo.order_index,
      }));

      const response = await fetch(`${API_URL}/todos/reorder`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todos: orderUpdates }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder todos");
      }

      // Optionally refresh from server to ensure consistency
      await fetchTodos();
    } catch (err) {
      console.error("[useTodos] reorderTodos failed:", err);
      setError("Failed to reorder todos. Please try again.");
      fetchTodos();
    }
  }

  async function editTodo(id: number, title: string) {
    try {
      setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, title } : todo)));

      const response = await fetch(`${API_URL}/todos/${id}/edit`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit todo");
      }
    } catch (err) {
      console.error("[useTodos] editTodo failed:", err);
      setError("Failed to edit todo. Please try again.");
      fetchTodos();
    }
  }

  function clearError() {
    setError(null);
  }

  return {
    todos,
    error,
    clearError,
    fetchTodos,
    addTodo,
    setTodoCompleted,
    deleteAllCompletedTodos,
    deleteTodo,
    reorderTodos,
    editTodo,
  };
}
