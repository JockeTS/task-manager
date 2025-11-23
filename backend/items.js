const express = require("express");
const router = express.Router();
const { insertItem, getItems, updateItem, deleteItem } = require("./database/index")

// Create (POST) an item
router.post("/", (req, res) => {  
  // const { name, position } = req.body;
  // const rowId = insertItem({ name, position });
  // console.log(rowId);
  // res.json({ rowId });

  // Make sure data types are correct
  const name = String(req.body.name).trim();
  const position = Number(req.body.position);

  if (!name) {
    return res.status(400).json({ error: "Required field(s) missing." });
  }

  const newItem = insertItem({ name, position }); console.log("new item:", newItem);
  res.json(newItem);
});

// Read (GET) all items, ordered by position
router.get("/", (req, res) => {
  const items = getItems();

  // Send items to client
  res.json(items);
});

// Update (PUT) an item
router.put("/:id", (req, res) => {
  const itemId = req.params.id;
  const fieldsToUpdate = req.body;
  updateItem(itemId, fieldsToUpdate);
  // res.json({ success: true });
});

// Delete (DELETE) an item
router.delete("/:id", (req, res) => {
  deleteItem(req.params.id);
  res.json({ success: true });
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