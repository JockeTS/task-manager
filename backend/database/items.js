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
