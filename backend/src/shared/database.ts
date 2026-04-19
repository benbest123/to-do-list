import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../database.sqlite");
const db = new Database(dbPath);

// Bootstrap the migrations tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    run_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const migrations: { name: string; sql: string }[] = [
  {
    name: "001_create_users",
    sql: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "002_create_todos",
    sql: `CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
  },
];

const alreadyRun = new Set((db.prepare("SELECT name FROM migrations").all() as { name: string }[]).map(r => r.name));

const runMigration = db.transaction((name: string, sql: string) => {
  db.exec(sql);
  db.prepare("INSERT INTO migrations (name) VALUES (?)").run(name);
});

for (const { name, sql } of migrations) {
  if (!alreadyRun.has(name)) {
    runMigration(name, sql);
    console.log(`Ran migration: ${name}`);
  }
}

export default db;
