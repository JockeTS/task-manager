import { database } from "./connection.js";

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