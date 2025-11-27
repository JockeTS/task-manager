// const express = require("express");
// const cors = require("cors");
// const itemRoutes = require("./items");

import express from "express";
import cors from "cors";
import itemRoutes from "./items.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/items", itemRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));