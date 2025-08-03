export interface TodoRow {
  id: number;
  title: string;
  completed: number; // SQLite stores as 0/1
}
