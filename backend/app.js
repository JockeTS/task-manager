import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import { initDb } from "./database/init.js";
import { seedDatabase } from "./database/seed.js";
import cors from "cors";
import itemRoutes from "./routes/items.js";
import { insertUser, getUserByEmail, getUserById } from "./database/users.js";
import { requireAuth } from "./middleware/auth.js";
import bcrypt from "bcrypt";

const app = express();

// Init the database: true to drop and recreate tables, false to keep existing
initDb(false);

// Seeds the database (only if empty)
seedDatabase();

app.use(cors({
  // origin: "http://localhost:5173",
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    }
  })
)

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = insertUser(email, hashedPassword);

  if (!userId) {
    return res.status(401).json({ error: "Registration failed" });  
  };

  req.session.userId = userId;

  res.json({ message: "Registered and Logged in" });
});

// Login - add user id to session
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Get user from db
  const user = getUserByEmail(email);

  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });  
  };

  /*
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: "Invalid credentials" });  
  };
  */

  req.session.userId = user.id;

  res.json({ message: "Logged in" });
});

// Logout - destroy session
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  })
});

// Get user object from user id in session
app.get("/me", (req, res) => {
  if (!req.session.userId) {
    res.json({ user: null });

    return; 
  }

  const user = getUserById(req.session.userId);

  res.json({
    user: {
      id: user.id,
      email: user.email
    }
  });
});

app.use("/items", requireAuth, itemRoutes);

// const PORT = 8000;
app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`));