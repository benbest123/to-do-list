import Taskbar from "../components/shared/Taskbar";
import AddTodoForm from "../components/todo/AddTodoForm";
import TodoList from "../components/todo/TodoList";
import TodoSummary from "../components/todo/TodoSummary";
import { useAuth } from "../hooks/useAuth";
import useTodos from "../hooks/useTodos";

function Todo() {
  const { todos, addTodo, setTodoCompleted, deleteAllCompletedTodos, deleteTodo, reorderTodos } = useTodos();
  const { username } = useAuth();

  return (
    <div className='flex flex-col h-screen'>
      <main className='py-10 flex-1 space-y-5 overflow-y-auto bg-[#008080]'>
        <div className='max-w-lg mx-auto bg-[#C0C0C0] round-md p-1 space-y-2 shadow-w95Container'>
          <div className='max-w-lg mx-auto bg-[#000080] text-white px-2 py-1'>{username}'s todos</div>
          <div className='max-w-lg mx-auto shadow-w95InnerContainer p-3'>
            <AddTodoForm onSubmit={addTodo} />
          </div>
          <div className='max-w-lg mx-auto shadow-w95InnerContainer p-3'>
            <TodoList
              todos={todos}
              onCompletedChange={setTodoCompleted}
              onDelete={deleteTodo}
              onReorder={reorderTodos}
            />
          </div>
        </div>
        <TodoSummary todos={todos} deleteAllCompleted={deleteAllCompletedTodos} />
      </main>
      <Taskbar />
    </div>
  );
}

export default Todo;
