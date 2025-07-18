import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../database.sqlite");
const db = new Database(dbPath);

// initialize todo table
db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT FALSE
    )`);

export default db;
