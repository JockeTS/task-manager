const express = require("express");
const router = express.Router();
const { getAllItemsOrdered, updateItem } = require("./database/index")

// Helper: build nested tree
function buildTree(items, parentId = null) {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({ ...item, items: buildTree(items, item.id) }));
}

// GET /items → get nested list
router.get("/", (req, res) => {
  const items = getAllItemsOrdered();
  // res.json(buildTree(items));
  res.json(items);
});

// Create a new item
router.post("/", (req, res) => {
  const id = insertItem(req.body);
  res.json({ id });
});

// Update an existing item
router.put("/:id", (req, res) => {
  updateItem(req.params.id, req.body);
  res.json({ success: true });
});

// Delete an existing item
router.delete("/:id", (req, res) => {
  deleteItem(req.params.id);
  res.json({ success: true });
});

module.exports = router;