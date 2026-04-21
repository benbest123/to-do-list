import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import xIcon from "../../icons/x-icon.png";
import { Todo } from "../../types/todo";
import { useState } from "react";

interface TodoItemProps {
  todo: Todo;
  onCompletedChange: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  isDraggable?: boolean;
  onEdit: (id: number, title: string) => void;
}

export default function TodoItem({ todo, onCompletedChange, onDelete, isDraggable = false, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(todo.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditable = () => {
    setDraft(todo.title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 ${isDragging ? "opacity-50" : ""}`}>
      {/* Drag handle - only show for incomplete todos */}
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600'
          title='Drag to reorder'
        >
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <circle cx='4' cy='4' r='1' />
            <circle cx='4' cy='8' r='1' />
            <circle cx='4' cy='12' r='1' />
            <circle cx='8' cy='4' r='1' />
            <circle cx='8' cy='8' r='1' />
            <circle cx='8' cy='12' r='1' />
          </svg>
        </div>
      )}

      <div className='flex items-center gap-2'>
        <label className='relative cursor-pointer'>
          <input
            type='checkbox'
            checked={todo.completed}
            onChange={e => onCompletedChange(todo.id, e.target.checked)}
            className='sr-only'
          />
          <div
            className={`
            w-4 h-4 border-2 bg-white relative
            ${todo.completed ? "border-t-gray-800 border-l-gray-800 border-r-gray-200 border-b-gray-200" : "border-t-gray-200 border-l-gray-200 border-r-gray-800 border-b-gray-800"}
          `}
          >
            {todo.completed && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-black text-xs font-bold leading-none'>✓</span>
              </div>
            )}
          </div>
        </label>
      </div>
      {!isEditing && (
        <label
          onClick={handleEditable}
          className='grow border bg-white border-gray-400 shadow-w95Input p-2 hover:bg-slate-100 cursor-pointer'
        >
          <span className={todo.completed ? "line-through text-gray-400" : ""}>{todo.title}</span>
        </label>
      )}
      {isEditing && (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className='grow border bg-white border-gray-400 shadow-w95Input p-2'
        />
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className='p-1 flex items-center justify-center bg-[#C0C0C0] shadow-w95Button'
      >
        <img src={xIcon} alt='delete'></img>
      </button>
    </div>
  );
}
