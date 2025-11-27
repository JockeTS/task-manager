import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
export const insertItem = database.transaction((item) => {
  // const newItemData = {
  //   name: item.name.trim(),
  //   position: item.position
  // };

  // throw new Error("Forced transaction failure for testing");

  // Insert a new item
  const result = database.prepare(`
    INSERT INTO items (name, position)
    VALUES (?, ?)
  `).run(item.name, item.position);

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
export const getItems = () => {
  const items = database.prepare(`
    SELECT *
    FROM items
    ORDER BY position, name
  `).all();

  return items;
}

// Update fields of a single item
export const updateItem = database.transaction((itemId, fieldsToUpdate) => {
  // Create a query-friendly string with the fields to be updated
  const fieldsString = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(", ");

  // Get arrays of values to use when updating
  const values = Object.values(fieldsToUpdate);

  // Use values from fieldsToUpdate object to update fields defined in fieldsString
  database.prepare(`
    UPDATE items SET ${fieldsString}
    WHERE id = ?
    `).run(values, itemId);

  // Procure and return the updated item
  const updatedItem = database.prepare(`
    SELECT *
    FROM items
    WHERE id = ?  
  `).get(itemId);

  return updatedItem;
});

// Delete an item, update positions
export const deleteItem = database.transaction((itemId) => {
  // Get the item to delete
  const itemToDelete = database.prepare("SELECT * FROM items WHERE id = ?").get(itemId);

  // Delete the item
  const result = database.prepare("DELETE FROM items WHERE id = ?").run(itemId);
  
  if (result.changes === 0) {
    throw new Error("Item not found or already deleted.");
  }

  // Update position on items with position > deleted item's position
  database.prepare("UPDATE items SET position = position - 1 WHERE position > ?").run(itemToDelete.position);

  return {
    "success": true,
    "deletedItemId": itemToDelete.id
  };
});

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