import { pool } from "./connection.js";

// Insert item with position shifting
export const insertItem = async (userId, newItemTemp) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (newItemTemp.parent_id === null) {
      await client.query(
        `
        UPDATE items
        SET position = position + 1
        WHERE position >= $1
        AND parent_id IS NULL
        AND user_id = $2
        `,
        [newItemTemp.position, userId]
      );
    } else {
      await client.query(
        `
        UPDATE items
        SET position = position + 1
        WHERE position >= $1
        AND parent_id = $2
        AND user_id = $3
        `,
        [newItemTemp.position, newItemTemp.parent_id, userId]
      );
    }

    const insertResult = await client.query(
      `
      INSERT INTO items (name, position, parent_id, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        newItemTemp.name,
        newItemTemp.position,
        newItemTemp.parent_id,
        userId
      ]
    );

    await client.query("COMMIT");

    return insertResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Get all items as tree
export const getItemsTree = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM items
    WHERE user_id = $1
    ORDER BY 
      CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
      parent_id ASC,
      position ASC
    `,
    [userId]
  );

  const rows = result.rows;

  function buildTree(items, parentId = null) {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        items: buildTree(items, item.id)
      }));
  }

  return buildTree(rows);
};

// Update item
export const updateItem = async (itemId, fieldsToUpdate, userId) => {
  const keys = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate);

  const setClause = keys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(", ");

  const result = await pool.query(
    `
    UPDATE items
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    AND user_id = $${keys.length + 2}
    RETURNING *
    `,
    [...values, itemId, userId]
  );

  return result.rows[0];
};

// Delete item and fix positions
export const deleteItem = async (itemId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const itemRes = await client.query(
      "SELECT * FROM items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );

    const itemToDelete = itemRes.rows[0];

    if (!itemToDelete) {
      throw new Error("Item not found");
    }

    await client.query(
      "DELETE FROM items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );

    if (itemToDelete.parent_id === null) {
      await client.query(
        `
        UPDATE items
        SET position = position - 1
        WHERE position > $1
        AND parent_id IS NULL
        AND user_id = $2
        `,
        [itemToDelete.position, userId]
      );
    } else {
      await client.query(
        `
        UPDATE items
        SET position = position - 1
        WHERE position > $1
        AND parent_id = $2
        AND user_id = $3
        `,
        [itemToDelete.position, itemToDelete.parent_id, userId]
      );
    }

    await client.query("COMMIT");

    return {
      success: true,
      deletedItemId: itemToDelete.id
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Delete all items and seed defaults
export const deleteItems = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM items WHERE user_id = $1",
      [userId]
    );

    const topLevel = await client.query(
      `
      INSERT INTO items (name, position, parent_id, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      ["Walk the dog", 1, null, userId]
    );

    const topLevelId = topLevel.rows[0].id;

    const subItems = [
      { name: "Get off the couch", position: 1 },
      { name: "Find the dog", position: 2 },
      { name: "Go out", position: 3 }
    ];

    for (const sub of subItems) {
      await client.query(
        `
        INSERT INTO items (name, position, parent_id, user_id)
        VALUES ($1, $2, $3, $4)
        `,
        [sub.name, sub.position, topLevelId, userId]
      );
    }

    await client.query("COMMIT");

    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Bulk update positions
export const updateItemPositions = async (items, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of items) {
      await client.query(
        `
        UPDATE items
        SET position = $1
        WHERE id = $2
        AND user_id = $3
        `,
        [item.position, item.id, userId]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/*
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
*/