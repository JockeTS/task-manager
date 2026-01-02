import Database from "better-sqlite3";

// DB connection
const db = new Database("task-manager.db");

// Add parent_id column
/*
db.prepare(`
  ALTER TABLE items
  ADD COLUMN parent_id INTEGER DEFAULT NULL
`).run();

  console.log("Migration complete");
*/

// Insert test items
/*
const { insertItem, getItems } = require("./index");

insertItem({name: "Finances", position: 1});
insertItem({name: "Appointments", position: 2});
insertItem({name: "Home", position: 3});
insertItem({name: "Work", position: 4});
insertItem({name: "Health", position: 5});

console.log(getItems());
*/