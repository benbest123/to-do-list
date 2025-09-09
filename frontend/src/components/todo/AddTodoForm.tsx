import { useState } from "react";

interface AddTodoFormProps {
  onSubmit: (title: string) => void;
}

export default function AddTodoForm({ onSubmit }: AddTodoFormProps) {
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input.trim()) return;

    await onSubmit(input);
    setInput("");
  }

  return (
    <form className="flex gap-2 bg-[#C0C0C0]" onSubmit={handleSubmit}>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="What needs to be done?" className="grow border bg-white border-gray-400 shadow-w95Input p-2" />
      <button type="submit" className="w-20 h-10 font-w95 bg-[#C0C0C0] text-black shadow-w95Button">
        Add
      </button>
    </form>
  );
}
