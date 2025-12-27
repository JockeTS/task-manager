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
    /*
    // Save user's changes to item after onBlur
    updateItemInState(savedItemTemp);

    console.log(savedItemTemp);

    // Add or update item in database
    try {
      const savedItem = savedItemTemp.isNew
        ? await createItem({
          name: savedItemTemp.name,
          position: savedItemTemp.position,
        })
        : await updateItem(savedItemTemp);

      // If item was saved to DB, update state with that actual item
      updateItemInState(savedItem);
    } catch (error) {
      // Revert optimistic update if item could not be saved to database
      removeItemFromUI(savedItemTemp);

      alert("Item could not be saved. Please try again.");
    }
    */

    // const item = findItemById(savedItemTemp.id);
    // console.log("Found item: ", item);

    console.log("saved item temp: ", savedItemTemp);

    setItems(prevItems =>
      updateItemInTree(prevItems, savedItemTemp.id, (item) => ({
        // completed: item.completed ? 0 : 1
        ...savedItemTemp
      }))
    );

    /*
    setItems(prevItems =>
      updateItemInTree(prevItems, savedItemTemp.id, {
        completed: savedItemTemp.completed ? 0 : 1
      })
    );
    */
  };

  // Add a new todo item below the clicked one
  const handleAddItemBelow = async (clickedItem) => {
    // console.log("cliikked item: ", clickedItem);

    // const parentId = clickedItem.parent_id;

    // const newPosition = clickedItem.position + 1;

    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      // position: newPosition,
      isNew: true
    };

    setItems(prevItems => {
      const newItems = insertAdjacent(prevItems, clickedItem.id, newItemTemp);
      console.log(newItems);

      return newItems;
    });

    console.log("all items: ", items);

    /*
    setItems(prevItems =>
      updateItemInTree(prevItems, clickedItem.id, (item) => ({
        completed: item.completed ? 0 : 1
      }))
    );
    */

    // Insert temporary item below clicked item

    /*
    // Update items optimistically
    setItems(prevItems => {
      const adjusted = prevItems.map(item => {
        if (item.position >= newPosition) {
          return { ...item, position: item.position + 1 };
        }
        return item;
      });

      // Insert the new item at the correct position
      return [
        ...adjusted.slice(0, newPosition - 1),
        newItemTemp,
        ...adjusted.slice(newPosition - 1)
      ];
    });
    */

    /* 
    The new item is not saved to the database right away, but rather auto-focused.
    When the user presses Enter or clicks outside the input field, the item's onBlur effect is triggered.
    This is how the item is saved to the database.
    */
  }

  function insertAdjacent(prevItems, targetId, newItem) {
    const targetIndex = prevItems.findIndex(item => item.id === targetId);

    // Check if target among current top-level items (if not, recurse)
    if (targetIndex !== -1) {
      console.log("indeks: ", targetIndex);

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
      /*
      for (const i of prevItems) {
        console.log("item: ", i);

        if (i.items?.length) {
          i.items = insertAdjacent(i.items, targetId, newItem);
        }
      }
      */
    }
    
    // return prevItems;

    /*
    const newItems = prevItems.map((item) => {
      console.log(item);
      return item;
    });

    return newItems;
    */
  };

  const handleItemDelete = async (itemToDelete) => {
    // Save original state in case database update fails
    const fallbackItems = items;

    console.log("item to delete: ", itemToDelete);

    setItems(prevItems => deleteItemInTree(prevItems, itemToDelete.id));

    /*
    // Delete item from database
    try {
      await deleteItem(itemToDelete.id);
    } catch (error) {
      console.error(error);

      setItems(fallbackItems);

      alert("Deletion failed. Please try again.");
    }
    */
  };

  const deleteItemInTree = (items, idToRemove) => {
    console.log("level");

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

    /*
    let changed = false;

    const result = tree.map(item => {
      if (item.id === id) {
        changed = true;
        return { ...item, ...updater(item) };
      }

      if (item.items?.length) {
        const updatedChildren = updateItemInTree(item.items, id, updater);
        if (updatedChildren !== item.items) {
          changed = true;
          return { ...item, items: updatedChildren };
        }
      }

      return item;
    });

    return changed ? result : tree;
    */
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
