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

  const handleItemSave = async (updatedItem) => {
    // Update item in state (optimistic update)
    setItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === updatedItem.id ? updatedItem : prevItem
      )
    );

    // Add or update item in database
    try {
      const savedItem = updatedItem.isNew
        ? await createItem({
          name: updatedItem.name,
          position: updatedItem.position,
        })
        : await updateItem(updatedItem);

      // If item was saved to DB, update state with that actual item
      if (savedItem) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === updatedItem.id ? savedItem : item
          )
        );
      }

      /*
      if (updatedItem.isNew) {
        await addItem({
        name: updatedItem.name,
        position: updatedItem.position
        });
      } else {
        await updateItem(updatedItem);
      }
      */
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Add a new todo item below the clicked one
  const handleAddItemBelow = async (position) => {
    // const clickedItem = items.find(item => item.id === itemId);
    // const newPosition = clickedItem.position + 1;
    const newPosition = position + 1;

    const newItem = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      position: newPosition,
      isNew: true
    }

    setItems(prevItems => {
      // Safety sort
      const sorted = [...prevItems].sort((a, b) => a.position - b.position);

      // Increment item positions (after point of insertion)
      const adjusted = sorted.map(item => {
        if (item.position >= newPosition) {
          return { ...item, position: item.position + 1 };
        }
        return item;
      });

      // Insert the new item at the correct position
      return [
        ...adjusted.slice(0, newPosition - 1),
        newItem,
        ...adjusted.slice(newPosition - 1)
      ];
    });

    /* 
    The new item is not saved to the database right away, but rather auto-focused.
    When the user presses Enter or clicks outside the input field, the item's onBlur effect is triggered.
    This is how the item is saved to the database.
    */
  }

  const handleItemDelete = async (itemId) => {
    // Find the item from the itemId
    // const clickedItem = items.find(item => item.id === itemId);
    // console.log(clickedItem);

    // Update state by filtering out the clicked item and doing a safety sort
    // Also recreate positions from indexes (indices?)

    setItems(prevItems => {
      // Remove the deleted item
      const filtered = prevItems.filter(prevItem => prevItem.id !== itemId);

      // Sort items by position
      const sorted = filtered.sort((a, b) => a.position - b.position);

      // Re-index positions
      return sorted.map((item, index) => ({ ...item, position: index + 1 }));
    });

    // Delete item from database
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error("Error deleting item: ", error);
    }

    /*
    setItems(prevItems => prevItems
      .filter(prevItem => prevItem.id !== itemId)
      .sort((a, b) => a.position - b.position))
      .map((item, index) => ({ ...item, position: index + 1 }));
    ;
    */
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My To-Do Items</h1>
      <ul>
        {items.map((item) => (
          <TodoItem
            key={item.id}
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
