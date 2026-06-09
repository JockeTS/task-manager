import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use SSL in production but not locally
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false

  /*
  // Always reject unencrypted database connections
  ssl: {
    rejectUnauthorized: false
  }
  */
});
