import { pool } from "./connection.js";

async function insertUser(email, passwordHash) {
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (!user) {
    await pool.query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
    `, [email, passwordHash]);
  }

  // return user.id;
}

async function insertItem(userId, name, completed = 0, position = 0, parentId = null) {
  await pool.query(`
    INSERT INTO items (user_id, name, completed, position, parent_id)
    VALUES ($1, $2, $3, $4, $5)
  `, [userId, name, completed, position, parentId]);
}

export const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Seeding starting");

    // Check users count
    const userCountResult = await client.query(
      "SELECT COUNT(*) FROM users"
    );
    const userCount = parseInt(userCountResult.rows[0].count, 10);

    if (userCount === 0) {
      // Create users
      const alice = await insertUser("alice@example.com", "hashedpassword1");
      const bob = await insertUser("bob@example.com", "hashedpassword2");

      const aliceId = alice.id;
      const bobId = bob.id;

      console.log("Users seeded");

      // Check items count
      const itemCountResult = await client.query(
        "SELECT COUNT(*) FROM items"
      );
      const itemCount = parseInt(itemCountResult.rows[0].count, 10);

      if (itemCount === 0) {
        // Insert tasks for Alice
        await insertItem(aliceId, "Finish portfolio project", 0, 0);
        await insertItem(aliceId, "Do laundry", 0, 1);
        await insertItem(aliceId, "Plan weekend trip", 0, 2);

        // Get parent task id
        const parentResult = await client.query(
          "SELECT id FROM items WHERE name = $1 AND user_id = $2",
          ["Finish portfolio project", aliceId]
        );

        const parentTaskId = parentResult.rows[0].id;

        // Nested tasks
        await insertItem(aliceId, "Write backend code", 0, 0, parentTaskId);
        await insertItem(aliceId, "Create frontend UI", 0, 1, parentTaskId);

        // Insert tasks for Bob
        await insertItem(bobId, "Buy groceries", 0, 0);
        await insertItem(bobId, "Clean room", 0, 1);

        console.log("Items seeded");
      } else {
        console.log("Items already exist, skipping seeding");
      }
    } else {
      console.log("Users already exist, skipping seeding.");
    }

    await client.query("COMMIT");
    console.log("Seeding done!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
  }
};

/*
import { database } from "./connection.js";

function insertUser(email, passwordHash) {
  const user = database.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    const stmt = database.prepare(`
      INSERT INTO users (email, password_hash)
      VALUES (?, ?)
    `);
    return stmt.run(email, passwordHash).lastInsertRowid;
  }
  return user.id;
}

function insertItem(userId, name, completed = 0, position = 0, parentId = null) {
  database.prepare(`
    INSERT INTO items (user_id, name, completed, position, parent_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, name, completed, position, parentId);
}

export const seedDatabase = database.transaction(() => {
  console.log("Seeding starting");

  // Only seed users table if empty
  const userCount = database.prepare("SELECT COUNT(*) AS count FROM users").get().count;

  if (userCount === 0) {
    // Create users Alice and Bob
    const aliceId = insertUser("alice@example.com", "hashedpassword1");
    const bobId = insertUser("bob@example.com", "hashedpassword2");

    console.log("Users seeded");

    // Only seed items table if empty
    const itemCount = database.prepare("SELECT COUNT(*) AS count FROM items").get().count;

    if (itemCount === 0) {
      // Insert tasks for Alice
      insertItem(aliceId, "Finish portfolio project", 0, 0);
      insertItem(aliceId, "Do laundry", 0, 1);
      insertItem(aliceId, "Plan weekend trip", 0, 2);

      // Insert nested tasks
      const parentTaskId = database.prepare("SELECT id FROM items WHERE name = ? AND user_id = ?")
        .get("Finish portfolio project", aliceId).id;

      insertItem(aliceId, "Write backend code", 0, 0, parentTaskId);
      insertItem(aliceId, "Create frontend UI", 0, 1, parentTaskId);

      // Insert tasks for Bob
      insertItem(bobId, "Buy groceries", 0, 0);
      insertItem(bobId, "Clean room", 0, 1);

      console.log("Items seeded");
    } else {
      console.log("Items already exist, skipping seeding");
    }
  } else {
    console.log("Users already exist, skipping seeding.");
  }

  console.log("Seeding done!");
});

// seedDatabase();
*/
