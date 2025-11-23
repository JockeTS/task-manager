import { useState } from "react";
import EditInput from "./EditInput";

function TodoItem({ item, onSave, onAddItemBelow, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  // const [value, setValue] = useState(item.name);

  /*
  useEffect(() => {
    if (isNew) setIsEditing(true);
  }, [isNew]);
  */

  // Item text is clicked (to complete / uncomplete it)
  const toggleCompleted = () => {
    // const completed = clickedItem.completed === 1 ? 0 : 1;
    // onSave({ ...clickedItem, completed: completed });
    onSave({ ...item, completed: item.completed ? 0 : 1 });
  };

  /*
  // Handle an input field losing focus
  const handleBlur = (newValue) => {
    // Only save if item name has actually changed
    if (newValue !== item.name) {
      // Update item in state and database
      onSave({ ...item, name: newValue });
    }

    setIsEditing(false);
  };
  */

  const handleBlur = (newValue) => {
    if (newValue.trim() !== item.name) {
      onSave({ ...item, name: newValue.trim() });
    }

    setIsEditing(false);
  };

  return (
    <li className={`item ${item.completed ? "completed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>

      {isEditing ? (
        /*
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
        />
        */

        <EditInput initialValue={item.name} onBlur={handleBlur} />
      ) : (
        <span onClick={toggleCompleted}>{item.name}</span>
      )}

      {isHovered && (
        <div className="button-container">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
          >
            ✏️
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onAddItemBelow(item.position);
              // onAddItemBelow(item.id);
            }}
          >
            Add
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(item.id);
            }}>
            🗑️
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;