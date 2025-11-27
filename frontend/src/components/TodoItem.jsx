import { useState } from "react";

function TodoItem({ item, onSave, onAddItemBelow, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);

  // Item text is clicked (to complete / uncomplete it)
  const toggleCompleted = () => {
    onSave({ ...item, completed: item.completed ? 0 : 1 });
  };

  /*
  const handleBlur = (newValue) => {
    if (newValue.trim() !== item.name) {
      onSave({ ...item, name: newValue.trim() });
    }

    setIsEditing(false);
  };
  */

  const handleBlur = () => {
    if (value.trim() !== item.name) {
      onSave({ ...item, name: value.trim() });
    }

    setIsEditing(false);
  };

  return (
    <li className={`item ${item.completed ? "completed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>

      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
        />

        // <EditInput initialValue={item.name} onBlur={handleBlur} />
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
              onAddItemBelow(item);
            }}
          >
            Add
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(item);
            }}>
            🗑️
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;