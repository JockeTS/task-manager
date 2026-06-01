import { pool } from "./connection.js";
import { insertUser } from "./usersDB.js";
import { insertItem } from "./itemsDB.js";

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
        await insertItem(aliceId, {
          name: "Finish portfolio project",
          parent_id: null,
          position: 0
        });

        await insertItem(aliceId, {
          name: "Do laundry",
          parent_id: null,
          position: 1
        });

        await insertItem(aliceId, {
          name: "Plan weekend trip",
          parent_id: null,
          position: 2
        });

        // Get parent task id
        const parentResult = await client.query(
          "SELECT id FROM items WHERE name = $1 AND user_id = $2",
          ["Finish portfolio project", aliceId]
        );

        const parentTaskId = parentResult.rows[0].id;

        // Nested tasks
        await insertItem(aliceId, {
          name: "Write backend code",
          parent_id: parentTaskId,
          position: 0
        });

        await insertItem(aliceId, {
          name: "Plan weekend trip",
          parent_id: parentTaskId,
          position: 1
        });

        // Insert tasks for Bob
        await insertItem(bobId, {
          name: "Buy groceries",
          parent_id: null,
          position: 0
        });

        await insertItem(bobId, {
          name: "Clean room",
          parent_id: null,
          position: 1
        });

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
