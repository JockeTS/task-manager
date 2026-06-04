import { useState } from "react";
import { SortableTodoItem } from "./SortableTodoItem";

import { FiMenu, FiEdit2, FiPlus, FiTrash2, FiCornerDownRight } from "react-icons/fi";
import { FaHighlighter } from "react-icons/fa";
import { PiHighlighterThin } from "react-icons/pi";
import { PiHighlighterBold } from "react-icons/pi";

import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { Tooltip } from 'react-tooltip';

const TodoItem = ({ level, item, onSave, onAddSiblingItem, onAddSubItem, onDelete, dragHandleProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);

  const fontSize = 16 + (4 * (level - 1));

  // Item text is clicked (to complete / uncomplete it)
  const toggleCompleted = () => {
    onSave({ ...item, completed: item.completed ? 0 : 1 });
  };

  // Item highlight is toggled
  const toggleHighlighted = () => {
    onSave({ ...item, highlighted: item.highlighted ? 0 : 1 });
  };

  // Handle input field being exited
  const handleBlur = () => {
    if (value.trim() !== item.name) {
      onSave({ ...item, name: value.trim() });
    }

    setIsEditing(false);
  };

  return (
    <div className="cursor-pointer mt-2 mb-1" style={{ fontSize: `${fontSize}px` }}>

      {/* Change from text to input if item is being edited */}
      {isEditing ? (

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
          style={{ fontSize: `${fontSize}px`, padding: `${fontSize * 0.5}px` }}
        />
      ) : ( // Show text span if item is not being edited
        <span
          className={`hover:bg-(--task-hover) px-2 pt-1 pb-2
            ${item.completed ? "line-through text-muted-foreground" : null}
            ${item.highlighted ? "bg-[#f8ff00]" : null}
          `}

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
            <div className="inline-flex mx-4 gap-2 align-middle">

              {/* Highlight */}
              <button
                className="hover:bg-yellow-100 rounded-md p-1 transition-colors cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleHighlighted();
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-highlight"
                data-tooltip-content="Highlight task"
              >
                <PiHighlighterBold />
                <Tooltip id="tooltip-highlight" delayShow={750} />
              </button>

              {/* Drag and Drop */}
              <button
                className="hover:bg-yellow-100 rounded-md p-1 transition-colors cursor-grab"
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-drag-and-drop"
                data-tooltip-content="Drag and drop task"
              >
                <FiMenu />
                <Tooltip id="tooltip-drag-and-drop" delayShow={750} />
              </button>

              {/* Edit */}
              <button
                className="hover:bg-yellow-100 rounded-md p-1 transition-colors cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-edit"
                data-tooltip-content="Edit task"
              >
                <FiEdit2 />
                <Tooltip id="tooltip-edit" delayShow={750} />
              </button>

              {/* Add Sibling */}
              <button
                className="hover:bg-yellow-100 rounded-md p-1 transition-colors cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddSiblingItem(item);
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-add-sibling"
                data-tooltip-content="Add sibling task"
              >
                <FiPlus />
                <Tooltip id="tooltip-add-sibling" delayShow={750} />
              </button>

              {/* Add Child */}
              <button
                className="hover:bg-yellow-100 rounded-md p-1 transition-colors cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddSubItem(item);
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-add-child"
                data-tooltip-content="Add child task"
              >
                <FiCornerDownRight />
                <Tooltip id="tooltip-add-child" delayShow={750} />
              </button>

              {/* Delete */}
              <button
                className="hover:bg-yellow-100 rounded-md p-1 transition-colors cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item);
                }}
                style={{ fontSize: `${fontSize}px` }}
                data-tooltip-id="tooltip-delete"
                data-tooltip-content="Delete task"
              >
                <FiTrash2 />
                <Tooltip id="tooltip-delete" delayShow={750} />
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
    </div>
  );
}

export default TodoItem;