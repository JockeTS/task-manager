const express = require("express");
const cors = require("cors");
const itemRoutes = require("./items");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/items", itemRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));