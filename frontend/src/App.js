import { useEffect, useState } from "react";
import { fetchItems, updateItem, createItem, deleteItem } from "./api/items";
import TodoItem from "./components/TodoItem";

function App() {
  const [items, setItems] = useState([]);

  // Fetch items from database
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchItems();

        setItems(data);
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };

    loadItems();
  }, []);

  const handleItemSave = async (savedItemTemp) => {
    const fallbackItems = items;

    // Save user's changes to item in state after onBlur
    setItems(prevItems =>
      updateItemInTree(prevItems, savedItemTemp.id, () => ({
        ...savedItemTemp
      }))
    );

    // Add or update item in database
    try {
      const savedItem = savedItemTemp.isNew
        ? await createItem({
          name: savedItemTemp.name,
          position: savedItemTemp.position,
          parent_id: savedItemTemp.parent_id
        })
        : await updateItem(savedItemTemp);

      // If item was saved to DB, update state with that actual item
      setItems(prevItems =>
        updateItemInTree(prevItems, savedItem.id, () => ({
          ...savedItem
        }))
      );
    } catch (error) {
      console.log("Error: ", error);

      // Revert optimistic update if item could not be saved to database
      setItems(fallbackItems);

      alert("Item could not be saved. Please try again.");
    }
  };

  // Add a new todo item below the clicked one
  const handleAddItemBelow = async (clickedItem) => {

    // Props for the new item
    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: clickedItem.parent_id,
      position: clickedItem.position + 1,
      isNew: true
    };

    // Add item to UI (onBlur saves it to db)
    setItems(prevItems => {
      const newItems = insertAdjacent(prevItems, clickedItem.id, newItemTemp);

      return newItems;
    });
  }

  // Insert new item adjacent to (below by default) another item with same parent_id (or null)
  function insertAdjacent(prevItems, targetId, newItem) {
    const targetIndex = prevItems.findIndex(item => item.id === targetId);

    // Check if target among current top-level items (if not, recurse)
    if (targetIndex !== -1) {
      const insertIndex = targetIndex + 1; // Insert item after target (below)

      return [
        ...prevItems.slice(0, insertIndex),
        newItem,
        ...prevItems.slice(insertIndex)
      ];
    } else {
      return prevItems.map(item => {
        if (item.items?.length) {
          return {
            ...item,
            items: insertAdjacent(item.items, targetId, newItem)
          }
        }

        return item;
      });
    }
  };

  const handleItemDelete = async (itemToDelete) => {
    // Save original state in case database update fails
    const fallbackItems = items;

    setItems(prevItems => deleteItemInTree(prevItems, itemToDelete.id));

    // Delete item from database
    try {
      await deleteItem(itemToDelete.id);
    } catch (error) {
      console.error(error);

      setItems(fallbackItems);

      alert("Deletion failed. Please try again.");
    }
  };

  const deleteItemInTree = (items, idToRemove) => {
    // Filter out itemToDelete if on current level
    const filtered = items.filter(item => item.id !== idToRemove);

    // If item was deleted on current level, update positions for top-level items and return them
    if (filtered.length !== items.length) {
      return filtered.map((item, index) => ({
        ...item,
        position: index + 1
      }));
    }

    // If item was not deleted on current level, go a level deeper for each item
    return filtered.map(item => ({
      ...item,
      items: deleteItemInTree(item.items || [], idToRemove)
    }));
  }

  function updateItemInTree(items, idToUpdate, updater) {
    let changed = false;

    const result = items.map(item => {
      if (item.id === idToUpdate) {
        changed = true;
        return { ...item, ...updater(item) };
      }

      if (item.items?.length) {
        const updatedChildren = updateItemInTree(item.items, idToUpdate, updater);

        if (updatedChildren !== item.items) {
          changed = true;
          return { ...item, items: updatedChildren };
        }
      }

      return item;
    })

    return changed ? result : items;
  }

  const findItemById = (id, nodes = items) => {
    // Check each node on current level in turn
    for (const node of nodes) {
      // Return node if it matches the id
      if (node.id === id) {
        return node;
      }

      // If not, check its child nodes (if any)
      if (node.items.length > 0) {
        const found = findItemById(id, node.items);

        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My To-Do Items</h1>
      <ul>
        {items.map((item) => (
          <TodoItem
            key={item.id}
            level={0}
            item={item}
            onSave={handleItemSave}
            onAddItemBelow={handleAddItemBelow}
            onDelete={handleItemDelete}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
