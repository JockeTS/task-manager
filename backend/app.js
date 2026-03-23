import express from "express";
import { database } from "./database/connection.js";
import { initDb } from "./database/init.js";
import { seedDatabase } from "./database/seed.js";
import cors from "cors";
import itemRoutes from "./items.js";

const app = express();

initDb();

app.use(cors());
app.use(express.json());

app.use("/items", itemRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));