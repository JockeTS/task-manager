import express from "express";
import { insertUser, getUserByEmail, getUserById } from "../database/users.js";
import bcrypt from "bcrypt";

// Auth router
const router = express.Router();

router.post("/register", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();

  if (!email || password.length < 6) {
    return res.status(401).json({ error: "Email or password can't be empty. Password must be at least 6 characters long." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = await insertUser(email, hashedPassword);

  if (!userId) {
    return res.status(401).json({ error: "Registration failed" });
  };

  req.session.userId = userId;

  res.json({ message: "Registered and Logged in" });
});

// Login - add user id to session
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Get user from db
  const user = await getUserByEmail(email);

  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  };

  req.session.userId = user.id;

  res.json({ message: "Logged in" });
});

// Logout - destroy session
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  })
});

// Get user object from user id in session
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    res.json({ user: null });

    return;
  }

  const user = await getUserById(req.session.userId);

  res.json({
    user: {
      id: user.id,
      email: user.email
    }
  });
});

export default router;