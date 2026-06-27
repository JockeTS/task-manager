import { apiFetch } from "./helper";

// Create an item or throw an error if unsuccessful
export const createItem = (newItemData) => {
  return apiFetch("/items", {
    method: "POST",
    body: JSON.stringify({ name: newItemData.name, position: newItemData.position, parent_id: newItemData.parent_id })
  });
};

// Fetch all items or throw an error if unsuccessful
export const fetchItems = () => {
  return apiFetch("/items");
};

// Update an item or throw an error if unsuccessful
export const updateItem = async (updatedItemData) => {
  return apiFetch(`/items/${updatedItemData.id}`, {
    method: "PATCH",
    body: JSON.stringify({ 
      completed: updatedItemData.completed, 
      name: updatedItemData.name, 
      highlighted: updatedItemData.highlighted, 
      collapsed: updatedItemData.collapsed,
      recurring: updatedItemData.recurring
    })
  });
};

// Delete an item or throw an error if unsuccessful
export const deleteItem = async (itemId) => {
  return apiFetch(`/items/${itemId}`, {
    method: "DELETE",
  });
};

// Delete all items or throw an error if unsuccessful
export const deleteItems = async () => {
  return apiFetch("/items", {
    method: "DELETE",
  });
};

// Update positions after drag & drop
export const updatePositionsInDb = async (items) => {
  return apiFetch("/items/positions", {
    method: "PUT",
    body: JSON.stringify({
      items: items.map(i => ({
        id: i.id,
        parent_id: i.parent_id,
        position: i.position
      }))
    })
  });
};