import { database } from "./connection.js";

// Update positions, insert new item
export const insertItem = database.transaction((userId, newItemTemp) => {

  // Update positions
  if (newItemTemp.parent_id === null) {
    database.prepare(`
      UPDATE items
      SET position = position + 1
      WHERE position >= ?
      AND parent_id IS NULL 
      AND user_id = ?
    `).run(newItemTemp.position, userId);
  } else {
    database.prepare(`
      UPDATE items
      SET position = position + 1
      WHERE position >= ?
      AND parent_id = ?
      AND user_id = ?
    `).run(newItemTemp.position, newItemTemp.parent_id, userId);
  }

  // Insert the new item
  const result = database.prepare(`
    INSERT INTO items (name, position, parent_id, user_id)
    VALUES (?, ?, ?, ?)
  `).run(newItemTemp.name, newItemTemp.position, newItemTemp.parent_id, userId);

  // Get the new item
  const newItem = database.prepare(`
    SELECT * FROM items WHERE id = ? AND user_id = ?
  `).get(result.lastInsertRowid, userId);

  return newItem;
});

// Get all items for a user in a tree structure
export const getItemsTree = (userId) => {
  const rows = database.prepare(`
    SELECT *
    FROM items
    WHERE user_id = ?
    ORDER BY 
        CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
        parent_id ASC,
        position ASC
  `).all(userId);

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
export const updateItem = database.transaction((itemId, fieldsToUpdate, userId) => {
  // Create a query-friendly string with the fields to be updated
  const fieldsString = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(", ");

  // Get arrays of values to use when updating
  const values = Object.values(fieldsToUpdate);

  // Use values from fieldsToUpdate object to update fields defined in fieldsString
  database.prepare(`
    UPDATE items SET ${fieldsString}
    WHERE id = ?
    AND user_id = ?
    `).run(values, itemId, userId);

  // Procure and return the updated item
  const updatedItem = database.prepare(`
    SELECT *
    FROM items
    WHERE id = ?
    AND user_id = ?
  `).get(itemId, userId);

  return updatedItem;
});

// Delete an item, update positions
export const deleteItem = database.transaction((itemId, userId) => {
  // Get the item to delete
  const itemToDelete = database.prepare("SELECT * FROM items WHERE id = ? AND user_id = ?").get(itemId, userId);

  // Delete the item
  const result = database.prepare("DELETE FROM items WHERE id = ? AND user_id = ?").run(itemId, userId);

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
      AND user_id = ?
    `).run(itemToDelete.position, userId);
  } else {
    database.prepare(`
      UPDATE items
      SET position = position - 1
      WHERE position > ?
      AND parent_id = ?
      AND user_id = ?
    `).run(itemToDelete.position, itemToDelete.parent_id, userId);
  }

  return {
    "success": true,
    "deletedItemId": itemToDelete.id
  };
});

// Delete all items, resetting the list
export const deleteItems = database.transaction((userId) => {

  // Delete existing items
  database.prepare("DELETE FROM items WHERE user_id = ?").run(userId);

  const topLevelResult = database
    .prepare(`
      INSERT INTO items (name, position, parent_id, user_id)
      VALUES (?, ?, ?, ?)
    `)
    .run("Walk the dog", 1, null, userId);

  const topLevelId = topLevelResult.lastInsertRowid;

  const subItems = [
    { name: "Get off the couch", position: 1 },
    { name: "Find the dog", position: 2 },
    { name: "Go out", position: 3 }
  ];

  for (const sub of subItems) {
    database
      .prepare(`
        INSERT INTO items (name, position, parent_id, user_id)
        VALUES (?, ?, ?, ?)
      `)
      .run(sub.name, sub.position, topLevelId, userId);
  }

  return {
    "success": true
  };
});

// Update item positions in changed items array after drag and drop
export const updateItemPositions = database.transaction((items, userId) => {
  const stmt = database.prepare(`
    UPDATE items
    SET position = ?
    WHERE id = ?
    AND user_id = ?
  `);

  for (const item of items) {
    stmt.run(item.position, item.id, userId);
  }
});