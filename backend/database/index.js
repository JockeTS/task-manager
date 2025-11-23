const path = require("path");
const Database = require("better-sqlite3");

const databasePath = path.join(__dirname, "task-manager.db");
const database = new Database(databasePath);

// Create items table if it doesn't exist
database.prepare(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        position INTEGER DEFAULT 0
    )    
`).run();

// Insert a single item, update positions >= new item's position (excluding new item)
const insertItem = database.transaction((item) => {
  const newItemData = {
    name: item.name.trim(),
    position: item.position
  };

  if (typeof newItemData.name !== "string" || newItemData.name === "") {
    throw new Error("Name must be a non-empty string.");
  }

  if (typeof newItemData.position !== "number" || newItemData.position <= 0) {
    throw new Error("Position must be a positive number.");
  }

  // Insert a new item
  const result = database.prepare(`
    INSERT INTO items (name, position)
    VALUES (?, ?)
  `).run(newItemData.name, newItemData.position);

  // Get the new item
  const newItem = database.prepare(`
    SELECT * FROM items WHERE id = ?
  `).get(result.lastInsertRowid);

  // Update positions
  database.prepare(`
    UPDATE items
    SET position = position + 1
    WHERE position >= ?
    AND id != ?
  `).run(newItem.position, newItem.id);

  return newItem;
});

// Get all items ordered by position and name (if position doesn't exist)
function getItems() {
  return database.prepare("SELECT * FROM items ORDER BY position, name").all();
}

// Update fields of a single item
const updateItem = (itemId, fieldsToUpdate) => {
  // Create a query-friendly string with the fields to be updated
  const fieldsString = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(", ");

  // Use values from fieldsToUpdate object to update fields defined in fieldsString
  database.prepare(`UPDATE items SET ${fieldsString} WHERE id = ?`).run(...Object.values(fieldsToUpdate), itemId);
};

const deleteItem = database.transaction((itemId) => {
  // Get the item to delete
  const itemToDelete = database.prepare("SELECT * FROM items WHERE id = ?").get(itemId);

  if (!itemToDelete) return;

  // Delete the item
  database.prepare("DELETE FROM items WHERE id = ?").run(itemId);

  // Update position on items after deleted item
  database.prepare("UPDATE items SET position = position - 1 WHERE position > ?").run(itemToDelete.position);
});

module.exports = { insertItem, getItems, updateItem, deleteItem };

/*
// Re-index positions, starting from 1
function normalizePositions() {
  database.prepare(`
    WITH ordered AS (
      SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY position ASC) AS new_position
      FROM items
    )
    UPDATE items
    SET position = (
      SELECT new_position
      FROM ordered
      WHERE ordered.id = items.id
    );
  `).run();
}
*/