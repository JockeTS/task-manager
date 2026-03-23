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

export function seedDatabase() {
  console.log("Seeding starting");

  // Create users Alice and Bob
  const aliceId = insertUser("alice@example.com", "hashedpassword1");
  const bobId = insertUser("bob@example.com", "hashedpassword2");

  // Only seed items if items table is empty
  const itemCount = database.prepare("SELECT COUNT(*) AS count FROM items").get().count;

  if (itemCount > 0) {
    console.log("Items already exist, skipping seeding items.");
    return;
  }

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

  console.log("Seeding done!");
}

// seedDatabase();

