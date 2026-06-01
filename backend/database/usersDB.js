import { pool } from "./connection.js";

// Insert a new user into database
export const insertUser = async (email, passwordHash) => {
  const result = await pool.query(`
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id
    `, [email, passwordHash]
  );

  return result.rows[0].id;
}

// Get a user by their email address
export const getUserByEmail = async (email) => {
  const result = await pool.query(`
    SELECT *
    FROM users
    WHERE email = $1
  `, [email]);

  return result.rows[0];
};

// Get a user by their id
export const getUserById = async (id) => {
  const result = await pool.query(`
    SELECT *
    FROM users
    WHERE id = $1
  `, [id]);

  return result.rows[0];
};
