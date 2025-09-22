import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../database.sqlite");
const db = new Database(dbPath);

// db.exec(`DROP TABLE IF EXISTS todos`);
// db.exec(`DROP TABLE IF EXISTS users`);

// initialize todo table
db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        user_id INTEGER NOT NULL,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)

    )`);

// Add order_index column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE todos ADD COLUMN order_index INTEGER DEFAULT 0`);
  // Update existing todos to have proper order_index values
  db.exec(`UPDATE todos SET order_index = id WHERE order_index = 0 OR order_index IS NULL`);
} catch (err) {
  // Column likely already exists, ignore error
}

// initialize users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

export default db;
