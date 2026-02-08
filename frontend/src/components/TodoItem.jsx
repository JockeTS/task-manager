import { useState, useRef } from "react";
import { SortableTodoItem } from "./SortableTodoItem";

import { FiMenu, FiEdit2, FiPlus, FiTrash2, FiCornerDownRight } from "react-icons/fi";

import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { Tooltip } from 'react-tooltip';

const TodoItem = ({ level, item, onSave, onAddSiblingItem, onAddSubItem, onDelete, dragHandleProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);
  // const [completed, setCompleted] = useState(item.completed);

  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);

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
    <div className="todo-item" style={{ fontSize: `${fontSize}px` }}>

      {/* Change from text to input if item is being edited */}
      {isEditing ? (
        // <EditInput initialValue={item.name} onBlur={handleBlur} />

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
          style={{ fontSize: `${fontSize}px` }}
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
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: `${fontSize}px`, color: "blue" }}
                data-tooltip-id="tooltip-drag-and-drop"
                data-tooltip-content="Drag and drop task"
              >
                <FiMenu />
                <Tooltip id="tooltip-drag-and-drop" delayShow={750}/>
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}
                style={{ fontSize: `${fontSize}px`, color: "yellow" }}
                data-tooltip-id="tooltip-edit"
                data-tooltip-content="Edit task"
              >
                <FiEdit2 />
                <Tooltip id="tooltip-edit" delayShow={750}/>
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddSiblingItem(item);
                }}
                style={{ fontSize: `${fontSize}px`, color: "green" }}
                data-tooltip-id="tooltip-add-sibling"
                data-tooltip-content="Add sibling task"
              >
                <FiPlus />
                <Tooltip id="tooltip-add-sibling" delayShow={750}/>
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddSubItem(item);
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-add-child"
                data-tooltip-content="Add child task"
              >
                <FiCornerDownRight />
                <Tooltip id="tooltip-add-child" delayShow={750}/>
              </button>

              <button
                className="action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item);
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-delete"
                data-tooltip-content="Delete task"
              >
                <FiTrash2 />
                <Tooltip id="tooltip-delete" delayShow={750}/>
              </button>
            </div>
          )}
        </span>
      )}

      {/* Render any potential child items */}
      {item.items && item.items.length > 0 && (
        <SortableContext
          items={item.items.map(child => child.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="todo-list">
            {item.items.map(child => (
              <SortableTodoItem
                key={child.id}
                item={child}
                level={level - 1}
                onSave={onSave}
                onAddSiblingItem={onAddSiblingItem}
                onAddSubItem={onAddSubItem}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>
      )}

      {/*
      {item.items && item.items.length > 0 && (
        <ul className="todo-list">
          {item.items.map(child => (
            <SortableTodoItem
              key={child.id}
              id={child.id}          // dnd-kit needs this
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
      */}

    </div>
  );
}

export default TodoItem;