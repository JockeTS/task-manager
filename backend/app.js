import express from "express";
import session from "express-session";
import { initDb } from "./database/init.js";
import { seedDatabase } from "./database/seed.js";
import cors from "cors";
import itemRoutes from "./routes/items.js";

const app = express();

// Init the database: true to drop and recreate tables, false to keep existing
initDb(false);

// Seeds the database (only if empty)
seedDatabase();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "very-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
)

app.use("/items", itemRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));