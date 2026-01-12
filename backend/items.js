import express from "express";
import { insertItem, getItems, updateItem, deleteItem, deleteItems, readTestData, getItemsTree } from "./database/index.js";
import { createItemSchema, updateItemSchema, paramsSchema } from "./validation/itemSchema.js";

const router = express.Router();

// Create (POST) an item
router.post("/", (req, res) => {
  // Parse contents of req.body to ensure they conform to item schema
  const parsedBody = createItemSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({ errors: parsedBody.error.errors });
  }

  try {
    const newItem = insertItem(parsedBody.data);
    
    if (!newItem) {
      throw new Error("Insert returned no item.");
    }

    // Send new item to client 
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Read (GET) all items, ordered by position
router.get("/", async (req, res) => {
  try {
    // const items = getItems();

    // const items = await readTestData();
    const items = getItemsTree();
    
    // Send items to client
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Update (PATCH) an item
router.patch("/:id", (req, res) => {
  // Validate params
  const parsedParams = paramsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({ errors: parsedParams.error.errors });
  }

  // Validate body
  const parsedBody = updateItemSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({ errors: parsedBody.error.errors });
  }

  try {
    const itemToUpdate = updateItem(parsedParams.data.id, parsedBody.data);

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
  const parsedParams = paramsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({ errors: parsedParams.error.errors });
  }

  try {
    const data = deleteItem(parsedParams.data.id);

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

// Delete (DELETE) all items
router.delete("/", (req, res) => {

  try {
    const data = deleteItems();

    // Send data to client
    res.status(200).json(data);
  } catch (error) {
    // Send error message to client
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;