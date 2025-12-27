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
        console.log(data);
        setItems(data);
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };

    loadItems();
  }, []);

  const handleItemSave = async (savedItemTemp) => {
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
  };

  // Add a new todo item below the clicked one
  const handleAddItemBelow = async (clickedItem) => {
    const newPosition = clickedItem.position + 1;

    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      position: newPosition,
      isNew: true
    };

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

    /* 
    The new item is not saved to the database right away, but rather auto-focused.
    When the user presses Enter or clicks outside the input field, the item's onBlur effect is triggered.
    This is how the item is saved to the database.
    */
  }

  const handleItemDelete = async (itemToDelete) => {
    // Save original state in case database update fails
    const fallbackItems = items;

    console.log("item to delete: ", itemToDelete);

    // Remove deleted item from UI
    // setItems(prev => removeItemById(prev, itemToDelete.id));

    setItems(prevItems => removeItemAndUpdatePositions(prevItems, itemToDelete.id));

    /*
    if (itemToDelete.parent_id) {
      const parentItem = findItemById(itemToDelete.parent_id);
      console.log("PA: ", parentItem);
      // console.log(itemToDelete.parent_id);

      setItems(prevItems => {
        const filteredItems = prevItems.filter(prevItem => prevItem.id !== itemToDelete.id);

        return filteredItems;
      });
    }
    */

    // Update items optimistically (remove deleted item, update positions)
    // removeItemFromUI(itemToDelete);

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

  function removeItemAndUpdatePositions(items, idToRemove) {
    // Filter out the item to remove
    const filtered = items
      .filter(item => item.id !== idToRemove)
      .map((item, index) => ({
        ...item,
        // Reassign positions based on the new order
        position: index + 1,
        // Recursively update child items
        items: removeItemAndUpdatePositions(item.items, idToRemove)
      }));

    return filtered;
  }

  const updatePositions = () => {

  }

  function removeItemById(items, targetId) {
    return items
      .filter(item => item.id !== targetId) // remove item if matched
      .map(item => ({
        ...item,
        items: removeItemById(item.items, targetId) // recursively clean children
      }));
  }

  function findItemById(id, nodes = items) {
    for (const node of nodes) {
      if (node.id === id) return node;

      if (node.items.length > 0) {
        const found = findItemById(id, node.items);
        if (found) return found;
      }
    }
    return null;
  }

  // Update an existing item in state with a new item
  const updateItemInState = (item) => {
    setItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === item.id ? item : prevItem
      )
    );
  }

  const removeItemFromUI = (itemToDelete) => {
    setItems(prevItems => {
      const filteredItems = prevItems.filter(prevItem => prevItem.id !== itemToDelete.id);

      const updatedPositionItems = filteredItems.map((item) => {
        if (item.position > itemToDelete.position) {

          return {
            ...item,
            position: item.position - 1
          };
        }

        return item;
      });

      return updatedPositionItems;
    });
  };

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
