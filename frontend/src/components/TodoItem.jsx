import { useState } from "react";
import EditInput from "./EditInput";

function TodoItem({ item, onUpdate, onAddNew, isNew = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  // const [value, setValue] = useState(item.name);

  // Item text is clicked (to complete / uncomplete it)
  const handleTextClick = async (clickedItem) => {
    const completed = clickedItem.completed === 1 ? 0 : 1;
    onUpdate({ ...clickedItem, completed: completed });
  };

  const handleBlur = (newValue) => {
    if (newValue !== item.name) {
      onUpdate({ ...item, name: newValue });
    }

    setIsEditing(false);
  };

  return (
    <li className={item.completed ? "item completed" : "item"}
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
        <span onClick={() => handleTextClick(item)}>{item.name}</span>
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
              onAddNew(item);
            }}
          >
            Add
          </button>

          <button>
            🗑️
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;