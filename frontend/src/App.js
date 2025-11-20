import { useEffect, useState } from "react";
import { fetchItems, updateItem, addItem } from "./api/items";
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

  // Update item optimistically before interacting with API
  const handleItemUpdate = async (updatedItem) => {
    console.log("u item: ", updatedItem);

    // Update item in state
    setItems((previousItems) =>
      previousItems.map((previousItem) =>
        previousItem.id === updatedItem.id ? updatedItem : previousItem
      )
    );

    // Update item in database
    try {
      if (updatedItem.isNew) {
        await addItem({
        name: updatedItem.name,
        position: updatedItem.position
        });
      } else {
        await updateItem(updatedItem);
      }

    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Add a new todo item below the clicked one
  const handleAddNewItemBelow = async (position) => {
    const newPosition = position + 1;

    const newItem = {
      id: items.length + 1,
      name: "",
      position: newPosition,
      isNew: true
    }

    setItems(prevItems => {
      // Increment item positions (after point of insertion)
      const adjusted = prevItems.map(item => {
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My To-Do Items</h1>
      <ul>
        {items.map((item) => (
          <TodoItem key={item.id} item={item} onUpdate={handleItemUpdate} onAddNewItemBelow={handleAddNewItemBelow} isNew={item.isNew} />
        ))}
      </ul>
    </div>
  );
}

export default App;
