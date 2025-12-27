import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

// For testing
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.join(__dirname, "task-manager.db");
const database = new Database(databasePath);

// Create items table if it doesn't exist
database.prepare(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER
        name TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        position INTEGER DEFAULT 0,

        FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
    );    
`).run();

// Load test data
export const readTestData = async () => {
  
  const data = JSON.parse(
    await fs.readFile(new URL("./dst2.json", import.meta.url))
  );

  return data;
};

// Update positions, insert new item
export const insertItem = database.transaction((newItemTemp) => {
  console.log("newItemTemp: ", newItemTemp);

  // Update positions
  if (newItemTemp.parent_id === null) {
    database.prepare(`
      UPDATE items
      SET position = position + 1
      WHERE position >= ?
      AND parent_id IS NULL  
    `).run(newItemTemp.position);
  } else {
    database.prepare(`
      UPDATE items
      SET position = position + 1
      WHERE position >= ?
      AND parent_id = ?
    `).run(newItemTemp.position, newItemTemp.parent_id);
  }

  // Insert the new item
  const result = database.prepare(`
    INSERT INTO items (name, position, parent_id)
    VALUES (?, ?, ?)
  `).run(newItemTemp.name, newItemTemp.position, newItemTemp.parent_id);

  // Get the new item
  const newItem = database.prepare(`
    SELECT * FROM items WHERE id = ?
  `).get(result.lastInsertRowid);

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
};

export const getItemsTree = () => {
  const rows = database.prepare(`
    SELECT *
    FROM items
    ORDER BY 
        CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
        parent_id ASC,
        position ASC
  `).all();

  // Build tree from sorted items
  function buildTree(items, parentId = null) {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        items: buildTree(items, item.id)
      }));
  }

  const tree = buildTree(rows);
  // console.log(JSON.stringify(tree, null, 2));
  return tree;
};

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
  if (itemToDelete.parent_id === null) {
    database.prepare(`
      UPDATE items
      SET position = position - 1
      WHERE position > ?
      AND parent_id IS NULL  
    `).run(itemToDelete.position);
  } else {
    database.prepare(`
      UPDATE items
      SET position = position - 1
      WHERE position > ?
      AND parent_id = ?
    `).run(itemToDelete.position, itemToDelete.parent_id);
  }

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