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
    // Update item in state (optimistic update)
    setItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === savedItemTemp.id ? savedItemTemp : prevItem
      )
    );

    // Add or update item in database
    try {
      const savedItem = savedItemTemp.isNew
        ? await createItem({
          name: savedItemTemp.name,
          position: savedItemTemp.position,
        })
        : await updateItem(savedItemTemp);

      // If item was saved to DB, update state with that actual item
      if (savedItem) {
        console.log("Saved Item: ", savedItem);

        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === savedItemTemp.id ? savedItem : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Add a new todo item below the clicked one
  const handleAddItemBelow = async (clickedItem) => {
    // const clickedItem = items.find(item => item.id === clickedItemId);
    const newPosition = clickedItem.position + 1;

    // const newPosition = position + 1;

    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      position: newPosition,
      isNew: true
    }

    setItems(prevItems => {
      // Safety sort (make sure items are sorted by position)
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

    // Update items optimistically (remove deleted item, update positions)
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

    // Delete item from database
    try {
      const data = await deleteItem(itemToDelete.id);

      console.log(data);
    } catch (error) {
      console.error(error);

      setItems(fallbackItems);

      alert("Deletion failed. Please try again.");
    }
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
