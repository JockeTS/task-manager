import { useState } from "react";

const fontSizes = [20, 16, 12];

const TodoItem = ({ level, item, onSave, onAddItemBelow, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);
  // const [completed, setCompleted] = useState(item.completed);

  // Item text is clicked (to complete / uncomplete it)
  const toggleCompleted = () => {
    // onSave({ ...item, completed: item.completed ? 0 : 1 });
    // console.log(completed);
    // setCompleted(completed ? 0 : 1);
    // console.log(completed);
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
    console.log("blur: ", item);

    if (value.trim() !== item.name) {
      onSave({ ...item, name: value.trim() });
    }

    setIsEditing(false);
  };

  return (
    <li>
      <div
        
        style={{ fontSize: `${fontSizes[level]}px` }}>

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
          <span
            className={`item ${item.completed ? "completed" : "pending"}`}
            onMouseEnter={(e) => {
              // e.stopPropagation();
              setIsHovered(true)
            }}
            onMouseLeave={(e) => {
              // e.stopPropagation();
              setIsHovered(false)
            }}
            onClick={toggleCompleted}>{item.name}

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
          </span>
        )}

        {item.items && item.items.length > 0 && (
          <ul>
            {item.items.map(child => (
              <TodoItem
                key={child.id}
                level={level + 1}
                item={child}
                onSave={onSave}
                onAddItemBelow={onAddItemBelow}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default TodoItem;