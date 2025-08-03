import AddTodoForm from "../components/todo/AddTodoForm";
import TodoList from "../components/todo/TodoList";
import TodoSummary from "../components/todo/TodoSummary";
import { useAuth } from "../hooks/useAuth";
import useTodos from "../hooks/useTodos";

function Todo() {
  const { todos, addTodo, setTodoCompleted, deleteAllCompletedTodos, deleteTodo } = useTodos();
  const { username } = useAuth();

  const handleToDoAdded = async (title: string) => {
    await addTodo(title);
  };
  return (
    <main className="py-10 h-screen space-y-5 overflow-y-auto">
      <h1 className="font-bold text-3xl text-center">{username}'s todos</h1>
      <div className="max-w-lg mx-auto bg-slate-100 round-md p-5 space-y-6">
        <AddTodoForm onSubmit={handleToDoAdded} />
        <TodoList todos={todos} onCompletedChange={setTodoCompleted} onDelete={deleteTodo} />
      </div>
      <TodoSummary todos={todos} deleteAllCompleted={deleteAllCompletedTodos} />
    </main>
  );
}

export default Todo;
