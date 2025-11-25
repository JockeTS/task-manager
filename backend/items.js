const express = require("express");
const router = express.Router();
const { insertItem, getItems, updateItem, deleteItem } = require("./database/index");

// Create (POST) an item
router.post("/", (req, res) => {
  try {
    // Make sure data types are correct
    const name = String(req.body.name).trim();
    const position = Number(req.body.position);

    if (!name || !position) {
      return res.status(400).json({ error: "Required field(s) missing." });
    }

    const newItem = insertItem({ name, position });

    if (!newItem) {
      throw new Error("Insert returned no item");
    }

    // Send new item to client 
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Read (GET) all items, ordered by position
router.get("/", (req, res) => {
  try {
    const items = getItems();

    // Send items to client
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Update (PATCH) an item
router.patch("/:id", (req, res) => {
  const itemId = req.params.id;
  const fieldsToUpdate = req.body;

  try {
    const itemToUpdate = updateItem(itemId, fieldsToUpdate);

    // If item to update was not found
    if (!itemToUpdate) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    res.status(200).json(itemToUpdate);
  } catch (error) {
    // If server-side error
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Delete (DELETE) an item
router.delete("/:id", (req, res) => {
  try {
    const data = deleteItem(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    // Send data to client
    res.status(200).json(data);
  } catch (error) {
    // Send error message to client
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;

/*
// Helper: build nested tree
function buildTree(items, parentId = null) {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({ ...item, items: buildTree(items, item.id) }));
}
*/