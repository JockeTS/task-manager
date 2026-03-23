import { database } from "./connection.js";

export function initDb(forceReset = false) {
  // database.pragma("foreign_keys = ON");

  if (forceReset) {
    database.prepare("DROP TABLE IF EXISTS items;").run();
    database.prepare("DROP TABLE IF EXISTS users;").run();
  }

  database.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

  // Create items table if it doesn't exist
  database.prepare(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      parent_id INTEGER,
      name TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      position INTEGER DEFAULT 0,

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
    );    
`).run();
}