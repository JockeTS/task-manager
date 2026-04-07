import { database } from "./connection.js";

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