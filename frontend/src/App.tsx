import AddTodoForm from "./components/AddTodoForm";
import TodoList from "./components/TodoList";
import TodoSummary from "./components/TodoSummary";
import useTodos from "./hooks/useTodos";

function App() {
  const { todos, fetchTodos, setTodoCompleted, deleteAllCompletedTodos, deleteTodo } = useTodos();

  const handleToDoAdded = async () => {
    fetchTodos();
  };
  return (
    <main className="py-10 h-screen space-y-5 overflow-y-auto">
      <h1 className="font-bold text-3xl text-center">Your Todos</h1>
      <div className="max-w-lg mx-auto bg-slate-100 round-md p-5 space-y-6">
        <AddTodoForm onSubmit={handleToDoAdded} />
        <TodoList todos={todos} onCompletedChange={setTodoCompleted} onDelete={deleteTodo} />
      </div>
      <TodoSummary todos={todos} deleteAllCompleted={deleteAllCompletedTodos} />
    </main>
  );
}

export default App;
