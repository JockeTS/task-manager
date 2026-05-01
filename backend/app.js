import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import { initDb } from "./database/init.js";
import { seedDatabase } from "./database/seed.js";
import cors from "cors";
import itemRoutes from "./routes/itemsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { insertUser, getUserByEmail, getUserById } from "./database/users.js";
import { requireAuth } from "./middleware/auth.js";
import bcrypt from "bcrypt";

const app = express();

// Init the database: true to drop and recreate tables, false to keep existing
initDb(false);

// Seeds the database (only if empty)
// seedDatabase();

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

app.use("/auth", authRoutes);
app.use("/items", requireAuth, itemRoutes);

// const PORT = 8000;
app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`));