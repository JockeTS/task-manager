import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.join(__dirname, "task-manager.db");
export const database = new Database(databasePath);

// Make sure foreign keys are enabled
database.pragma("foreign_keys = ON");