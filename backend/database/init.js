import { pool } from "./connection.js";

export async function initDb(forceReset = false) {
  if (forceReset) {
    await pool.query("DROP TABLE IF EXISTS sessions CASCADE;");
    await pool.query("DROP TABLE IF EXISTS items CASCADE;");
    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT NOT NULL PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMPTZ NOT NULL
    );
  `);

  // Index for sessions table
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_session_expire
    ON sessions (expire);  
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER NOT NULL,
      parent_id INTEGER,
      name TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      position INTEGER DEFAULT 0,

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
    );
  `);

  // Indexes for items table
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_items_user_id
    ON items(user_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_items_parent_id
    ON items(parent_id);
  `);
}

/*
export async function initDb(forceReset = false) {
  if (forceReset) {
    await pool.query("DROP TABLE IF EXISTS items");
    await pool.query("DROP TABLE IF EXISTS users");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      parent_id INTEGER,
      name TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      position INTEGER DEFAULT 0,

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
    );
  `);
}
*/

/*
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
*/