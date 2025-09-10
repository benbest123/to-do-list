import xIcon from "../../icons/x-icon.png";
import { Todo } from "../../types/todo";

interface TodoItemProps {
  todo: Todo;
  onCompletedChange: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onCompletedChange, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-1">
      <label className="grow border bg-white border-gray-400 shadow-w95Input p-2 hover:bg-slate-100">
        <input type="checkbox" checked={todo.completed} onChange={(e) => onCompletedChange(todo.id, e.target.checked)} className="sr-only" />
        <span className={todo.completed ? "line-through text-gray-400" : ""}>{todo.title}</span>
      </label>
      <button onClick={() => onDelete(todo.id)} className="p-1 flex items-center justify-center bg-[#C0C0C0] shadow-w95Button">
        <img src={xIcon} alt="delete"></img>
      </button>
    </div>
  );
}
