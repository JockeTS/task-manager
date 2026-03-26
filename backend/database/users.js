import { database } from "./connection.js";

export const getUserByEmail = (email) => {
  const user = database.prepare(`
    SELECT *
    FROM users
    WHERE email = ?  
  `).get(email);

  return user;
};