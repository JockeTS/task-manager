import express from "express";
import session from "express-session";
import { initDb } from "./database/init.js";
import { seedDatabase } from "./database/seed.js";
import cors from "cors";
import itemRoutes from "./routes/items.js";
import { insertUser, getUserByEmail, getUserById } from "./database/users.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

// Init the database: true to drop and recreate tables, false to keep existing
initDb(false);

// Seeds the database (only if empty)
seedDatabase();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: "very-secret-key",
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

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const userId = insertUser(email, password);

  if (!userId) {
    return res.status(401).json({ error: "Registration failed" });  
  };

  req.session.userId = userId;

  res.json({ message: "Registered and Logged in" });
});

// Login - add user id to session
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Get user from db
  const user = getUserByEmail(email);

  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: "Invalid credentials" });  
  };

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

  /*
  if (!req.session.userId) {
    return res.status(400).json({ user: null });
  }

  res.json({ userId: req.session.userId });
  */
});

app.use("/items", requireAuth, itemRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));