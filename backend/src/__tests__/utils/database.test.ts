import { dbToTodo } from "../../shared/utils/database";
import { TodoRow } from "../../shared/types/todorow";

describe("dbToTodo", () => {
  const baseRow: TodoRow = {
    id: 1,
    title: "Test todo",
    completed: 0,
    user_id: 42,
    order_index: 1,
  };

  it("converts completed = 0 to false", () => {
    const todo = dbToTodo({ ...baseRow, completed: 0 });
    expect(todo.completed).toBe(false);
  });

  it("converts completed = 1 to true", () => {
    const todo = dbToTodo({ ...baseRow, completed: 1 });
    expect(todo.completed).toBe(true);
  });

  it("preserves all other fields unchanged", () => {
    const todo = dbToTodo(baseRow);
    expect(todo.id).toBe(1);
    expect(todo.title).toBe("Test todo");
    expect(todo.user_id).toBe(42);
    expect(todo.order_index).toBe(1);
  });

  it("returns an object with boolean type for completed", () => {
    const todo = dbToTodo(baseRow);
    expect(typeof todo.completed).toBe("boolean");
  });
});
