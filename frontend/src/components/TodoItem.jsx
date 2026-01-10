import { useState } from "react";

const fontSizes = [20, 16, 12];

const TodoItem = ({ level, item, onSave, onAddSiblingItem, onAddSubItem, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);
  // const [completed, setCompleted] = useState(item.completed);

  const fontSize = 16 + (4 * (level - 1));

  // Item text is clicked (to complete / uncomplete it)
  const toggleCompleted = () => {
    onSave({ ...item, completed: item.completed ? 0 : 1 });
  };

  // Handle input field being exited
  const handleBlur = () => {
    if (value.trim() !== item.name) {
      onSave({ ...item, name: value.trim() });
    }

    setIsEditing(false);
  };

  return (
    <li className="todo-item"
      style={{
        fontSize: `${fontSize}px`,

      }}>

      {/* Change from text to input if item is being edited */}
      {isEditing ? (
        // <EditInput initialValue={item.name} onBlur={handleBlur} />

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
        />
      ) : ( // Show text span if item is not being edited
        <span className={`${item.completed ? "completed" : "pending"}`}

          // Activate or deactivate hovered state when mouse enters or leaves item
          onMouseEnter={(e) => {
            setIsHovered(true)
          }}

          onMouseLeave={(e) => {
            setIsHovered(false)
          }}

          onClick={toggleCompleted}>

          {item.name}

          {/* Show action buttons when item is hovered */}
          {isHovered && (
            <div className="button-container">
              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}

                style={{ fontSize: `${fontSize}px` }}
              > ✏️
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddSiblingItem(item);
                }}

                style={{ fontSize: `${fontSize}px` }}
              > ↓ +
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddSubItem(item);
                }}

                style={{ fontSize: `${fontSize}px` }}
              > ↳ +
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item);
                }}

                style={{ fontSize: `${fontSize}px` }}
              > 🗑️
              </button>
            </div>
          )}
        </span>
      )}

      {/* Render any potential child items */}
      {item.items && item.items.length > 0 && (
        <ul className="todo-list">
          {item.items.map(child => (
            <TodoItem
              key={child.id}
              level={level - 1}
              item={child}
              onSave={onSave}
              onAddSiblingItem={onAddSiblingItem}
              onAddSubItem={onAddSubItem}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default TodoItem;