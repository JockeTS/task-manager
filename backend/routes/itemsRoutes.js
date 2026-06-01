import express from "express";
import { createItemSchema, paramsSchema, updateItemSchema } from "../validation/itemSchema.js";
import { deleteItem, deleteItems, getItemsTree, insertItem, updateItem, updateItemPositions } from "../database/itemsDB.js";

const router = express.Router();

// router.use(requireAuth);

// Create (POST) an item
router.post("/", async (req, res) => {
  const userId = req.session.userId;

  // Parse contents of req.body to ensure they conform to item schema
  const parsedBody = createItemSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({ errors: parsedBody.error.errors });
  }

  try {
    const newItem = await insertItem(userId, parsedBody.data);
    
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
  const userId = req.session.userId;

  try {
    // const items = getItems();

    // const items = await readTestData();
    const items = await getItemsTree(userId);
    
    // Send items to client
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Update (PATCH) an item
router.patch("/:id", async (req, res) => {
  const userId = req.session.userId;

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
    const itemToUpdate = await updateItem(parsedParams.data.id, parsedBody.data, userId);

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
router.delete("/:id", async (req, res) => {
  const userId = req.session.userId;

  const parsedParams = paramsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({ errors: parsedParams.error.errors });
  }

  try {
    const data = await deleteItem(parsedParams.data.id, userId);

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
router.delete("/", async (req, res) => {
  const userId = req.session.userId;

  try {
    // AWAIT
    const data = await deleteItems(userId);

    // Send data to client
    res.status(200).json(data);
  } catch (error) {
    // Send error message to client
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Update positions after drag & drop
router.put("/positions", async (req, res) => {
  const userId = req.session.userId;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid payload." });
  }

  try {
    await updateItemPositions(items, userId);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;