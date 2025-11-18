const path = require("path");
const Database = require("better-sqlite3");

const databasePath = path.join(__dirname, "task-manager.db");
const database = new Database(databasePath);

database.prepare(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        position INTEGER DEFAULT 0
    )    
`).run();

function insertItem(name, position = 0) {
    const statement = database.prepare(`
        INSERT
        INTO items
        (name, position)
        VALUES (?, ?)    
    `);

    return statement.run(name, position).lastInsertRowid;
}

/*
function insertItem({ name, parent_id = null, user = null, sort_order = 0 }) {
  const stmt = db.prepare(
    `INSERT INTO items (name, parent_id, user, sort_order) VALUES (?, ?, ?, ?)`
  );
  return stmt.run(name, parent_id, user, sort_order).lastInsertRowid;
}
  */

function getAllItems() {
    return database.prepare("SELECT * FROM items").all();
}

// Get all items ordered by position and name (if position doesn't exist)
function getAllItemsOrdered() {
    return database.prepare("SELECT * FROM items ORDER BY position, name").all();
}

function updateItem(id, fields) {
  const updates = Object.keys(fields).map(key => `${key} = ?`).join(", ");
  console.log(updates);

  database.prepare(`UPDATE items SET ${updates} WHERE id = ?`).run(...Object.values(fields), id);
}

function deleteItem(id) {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}

module.exports = { database, insertItem, getAllItems, getAllItemsOrdered, updateItem };