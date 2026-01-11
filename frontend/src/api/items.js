// Create an item or throw an error if unsuccessful
export const createItem = async (newItemData) => {
  const res = await fetch(`http://localhost:8000/items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newItemData.name, position: newItemData.position, parent_id: newItemData.parent_id })
  });

  let newItem;

  try {
    newItem = await res.json();
  } catch (error) {
    newItem = null;
  }

  if (!res.ok) {
    throw new Error(newItem.message || "Create item failed.");
  }

  return newItem;
};

// Fetch all items or throw an error if unsuccessful
export const fetchItems = async () => {
  const res = await fetch("http://localhost:8000/items", {
    method: "GET"
  });

  let items;

  try {
    items = await res.json();
  } catch (error) {
    items = null;
  }

  if (!res.ok) {
    throw new Error(items?.message || "Fetch items failed.");
  }

  return items;
};

// Update an item or throw an error if unsuccessful
export const updateItem = async (updatedItemData) => {
  const res = await fetch(`http://localhost:8000/items/${updatedItemData.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: updatedItemData.completed, name: updatedItemData.name })
  });

  let updatedItem;

  try {
    updatedItem = await res.json();
  } catch (error) {
    updatedItem = null;
  }

  if (!res.ok) {
    throw new Error(updatedItem?.message || "Update item failed.");
  }

  return updatedItem;
};

// Delete an item or throw an error if unsuccessful
export const deleteItem = async (itemId) => {
  const res = await fetch(`http://localhost:8000/items/${itemId}`, {
    method: "DELETE",
  });

  let success;

  try {
    success = await res.json();
  } catch {
    success = null;
  }

  if (!res.ok) {
    throw new Error(success?.message || "Delete item failed.");
  }

  return success;
};

// Delete all items or throw an error if unsuccessful
export const deleteItems = async () => {
  const res = await fetch("http://localhost:8000/items/", {
    method: "DELETE",
  });

  let success;

  try {
    success = await res.json();
  } catch {
    success = null;
  }

  if (!res.ok) {
    throw new Error(success?.message || "Delete items failed.");
  }

  return success;
};