import { useEffect, useState } from "react";
import { fetchItems, updateItem } from "./api/items";
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
    // Update item in state
    setItems((previousItems) =>
      previousItems.map((previousItem) =>
        previousItem.id === updatedItem.id ? updatedItem : previousItem
      )
    );

    // Update item in database
    try {
      await updateItem(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleAddNewItemBelow = async (item) => {
    console.log(item);
    const newPosition = item.position;
    console.log(newPosition);

    const newItem = {
      id: items.length + 1,
      name: "test",
      // position: items.length + 1
      isNew: true
    }

    setItems((previousItems) => {

      return [
        ...previousItems.slice(0, newPosition),
        newItem,
        ...previousItems.slice(newPosition)
      ];
    });

    try {
      await updateItem(newItem);
    } catch (error) {
      console.error("Error updating item:", error);
    }

    /*
    setItems((previousItems) =>
      previousItems.map((previousItem) => {
        // previousItem.id === updatedItem.id ? updatedItem : previousItem
        if (previousItem.position === newPosition) {
          return newItem;
        } else {
          return previousItem;
        }
      }
      )
    );

    setItems((previousItems) => [
      ...previousItems,
      {
        id: items.length + 1,
        name: "test",
        // position: items.length + 1
        isNew: true
      }
    ])
    */

    // Create temporary todo item (input field) below clicked item (position +1)

    // Make sure user enters text and leaves input field

    // Add new item to db, re-render list
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My To-Do Items</h1>
      <ul>
        {items.map((item) => (
          <TodoItem key={item.id} item={item} onUpdate={handleItemUpdate} onAddNew={handleAddNewItemBelow} isNew={item.isNew} />
        ))}
      </ul>
    </div>
  );
}

export default App;
