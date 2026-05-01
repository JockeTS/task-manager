import { pool } from "./connection.js";

export const insertUser = async(email, passwordHash) => {
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (!user) {
    await pool.query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
    `, [email, passwordHash]);
  }

  // return user.id;
}

export const getUserByEmail = async (email) => {
  const result = await pool.query(`
    SELECT *
    FROM users
    WHERE email = $1
  `, [email]);

  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query(`
    SELECT *
    FROM users
    WHERE id = $1
  `, [id]);

  return result.rows[0];
};

/*
export const insertUser = (email, passwordHash) => {
    const user = database.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      const stmt = database.prepare(`
        INSERT INTO users (email, password_hash)
        VALUES (?, ?)
      `);

      return stmt.run(email, passwordHash).lastInsertRowid;
    }

    // Return existing user id if user already in database
    // return user.id;
    return null;
}

export const getUserByEmail = (email) => {
  const user = database.prepare(`
    SELECT *
    FROM users
    WHERE email = ?  
  `).get(email);

  return user;
};

export const getUserById = (id) => {
  const user = database.prepare(`
    SELECT *
    FROM users
    WHERE id = ?  
  `).get(id);

  return user;
};
*/