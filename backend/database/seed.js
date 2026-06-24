import { pool } from "./connection.js";
import { insertUser } from "./usersDB.js";
import { insertItem } from "./itemsDB.js";
import bcrypt from "bcrypt";

export const insertSampleTasks = async (userId) => {
  console.log("Inserting sample tasks");

  // Insert parent sample task
  const parentTask1 = await insertItem(
    userId, {
    name: "Finish portfolio project",
    parent_id: null,
    position: 0
  });

  // Insert child sample tasks
  await insertItem(userId, {
    name: "Write backend code",
    parent_id: parentTask1.id,
    position: 0
  });

  await insertItem(userId, {
    name: "Write frontend code",
    parent_id: parentTask1.id,
    position: 1
  });
}

export const seedDatabase = async () => {
  try {
    console.log("Seeding starting");

    // Clear tables and restart ids from 0
    await pool.query(
      "TRUNCATE TABLE users, items, sessions RESTART IDENTITY CASCADE;"
    );

    console.log("Tables truncated");

    const hashedPassword1 = await bcrypt.hash("hashedpassword1", 10);
    const hashedPassword2 = await bcrypt.hash("hashedpassword2", 10);

    const aliceId = await insertUser("alice@example.com", hashedPassword1);
    const bobId = await insertUser("bob@example.com", hashedPassword2);

    console.log("Users seeded");

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
    const parentResult = await pool.query(
      "SELECT id FROM items WHERE name = $1 AND user_id = $2",
      ["Finish portfolio project", aliceId]
    );

    const parentTaskId = parentResult.rows[0].id;

    // Insert nested tasks for Alice
    await insertItem(aliceId, {
      name: "Write backend code",
      parent_id: parentTaskId,
      position: 0
    });

    await insertItem(aliceId, {
      name: "Write frontend code",
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

    console.log("Seeding done!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
};
