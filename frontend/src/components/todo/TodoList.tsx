import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Todo } from "../../types/todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onCompletedChange: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onReorder: (todos: Todo[]) => void;
}

export default function TodoList({ todos, onCompletedChange, onDelete, onReorder }: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separate completed and incomplete todos
  const incompleteTodos = todos.filter((todo) => !todo.completed).sort((a, b) => a.order_index - b.order_index);

  const completedTodos = todos.filter((todo) => todo.completed).sort((a, b) => a.order_index - b.order_index);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = Number(active.id);
      const overId = Number(over.id);

      // Find which todo was moved
      const activeTodo = todos.find((todo) => todo.id === activeId);
      if (!activeTodo || activeTodo.completed) return; // Only allow reordering incomplete todos

      const oldIndex = incompleteTodos.findIndex((todo) => todo.id === activeId);
      const newIndex = incompleteTodos.findIndex((todo) => todo.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder the incomplete todos
      const reorderedIncompleteTodos = arrayMove(incompleteTodos, oldIndex, newIndex);

      // Update order_index for reordered todos
      const updatedIncompleteTodos = reorderedIncompleteTodos.map((todo, index) => ({
        ...todo,
        order_index: index,
      }));

      // Combine with completed todos (keep their original order_index)
      const allTodos = [...updatedIncompleteTodos, ...completedTodos];

      onReorder(allTodos);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {/* Incomplete todos - draggable */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={incompleteTodos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
            {incompleteTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onCompletedChange={onCompletedChange} onDelete={onDelete} isDraggable={true} />
            ))}
          </SortableContext>
        </DndContext>

        {/* Completed todos - not draggable */}
        {completedTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onCompletedChange={onCompletedChange} onDelete={onDelete} isDraggable={false} />
        ))}
      </div>
      {todos.length === 0 && <p className="text-center text-sm text-gray-500">No todos yet. Add a new one above.</p>}
    </>
  );
}
