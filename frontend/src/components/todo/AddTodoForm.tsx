import { useState } from "react";
import { API_URL } from "../../utils/constants";

interface AddTodoFormProps {
  onSubmit: (title: string) => void;
}

export default function AddTodoForm({ onSubmit }: AddTodoFormProps) {
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      const newTodo = await response.json();

      onSubmit(newTodo.title);
      setInput("");
    } catch (err) {
      console.error("error adding todo:", err);
    }
  }

  return (
    <form className="flex" onSubmit={handleSubmit}>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="What needs to be done?" className="rounded-s-md grow border bg-white border-gray-400 p-2" />
      <button type="submit" className="w-16 rounded-e-md bg-slate-900 text-white hover:bg-slate-800">
        Add
      </button>
    </form>
  );
}
