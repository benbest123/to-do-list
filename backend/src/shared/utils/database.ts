import { Todo } from "../types/todo";
import { TodoRow } from "../types/todorow";

// frontend handles completed as a bool, sqlite db stores it as an int
// helper functions to handle the conversion here
export const dbToTodo = (row: TodoRow): Todo => ({
  ...row,
  completed: Boolean(row.completed),
});

export const todoToDb = (todo: Todo): TodoRow => ({
  ...todo,
  ...{ completed: todo.completed ? 1 : 0 },
});
