import React, { useEffect, useRef, useState } from "react";
import { fetchItems, updateItem } from "./api/items";

function App() {
  const [items, setItems] = useState([]);

  const [hoveredId, setHoveredId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const inputRef = useRef(null);

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

  // Focus on input field whenever an item is being edited
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      // Move cursor to the end of the text
      inputRef.current.setSelectionRange(length, length);
    }
  }, [editingId]);
  
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

  // Item text is clicked (to complete / uncomplete it)
  const handleTextClick = async (clickedItem) => {
    const updatedItem = { ...clickedItem, completed: clickedItem.completed === 1 ? 0 : 1 };
    handleItemUpdate(updatedItem);
  };

  // Item edit button is clicked (to edit its text)
  const handleEditButtonClick = async (clickedItem) => {
    // Set state of which item and text is currently being edited
    setEditingId(clickedItem.id);
    setEditingText(clickedItem.name);
  }

  const handleInputBlur = (editedItem) => {
    editedItem.name = editingText;
    handleItemUpdate(editedItem);
    setEditingId(null);
  };

  // Treat pressing enter as leaving the input field
  const handleInputKeyDown = (event, editedItem) => {
    if (event.key === "Enter") {
      handleInputBlur(editedItem);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My To-Do Items</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={item.completed ? "item completed" : item}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}>

            {editingId === item.id ? (
              <input
                ref={inputRef}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => handleInputBlur(item)}
                onKeyDown={(e) => handleInputKeyDown(e, item)}
              />
            ) : (
              <span onClick={() => handleTextClick(item)}>{item.name}</span>
            )}

            {hoveredId === item.id && (
              <div className="button-container">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEditButtonClick(item);
                  }}
                >
                  ✏️
                </button>

                <button>
                  🗑️
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
