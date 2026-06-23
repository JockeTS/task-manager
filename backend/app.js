// import dotenv from "dotenv";
// dotenv.config();

import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { initDb } from "./database/init.js";
import { seedDatabase } from "./database/seed.js";
import cors from "cors";
import itemRoutes from "./routes/itemsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/auth.js";
import { pool } from "./database/connection.js";

const PostgresStore = pgSession(session);

const app = express();

// Init the database: true to drop and recreate schema, false to keep as-is
initDb(false);

// Seed the database (resets everything)
// seedDatabase();

app.set("trust proxy", 1);

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    store: new PostgresStore({
      pool: pool,
      tableName: "sessions"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      // sameSite: "none",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30 // Valid for 30 days
    }
  })
)

app.use("/auth", authRoutes);
app.use("/items", requireAuth, itemRoutes);

app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`));