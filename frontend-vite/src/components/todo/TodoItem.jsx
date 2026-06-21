import { useState } from "react";
import { SortableTodoItem } from "./SortableTodoItem";

import { FiMenu, FiEdit2, FiPlus, FiTrash2, FiCornerDownRight } from "react-icons/fi";
import { PiHighlighterBold } from "react-icons/pi";

import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { Tooltip } from 'react-tooltip';

import ActionButton from "./ActionButton";

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
    <div className="" /* style={{ marginBottom: item.parent_id === null ? `${fontSize}px` : `0`, marginLeft: `${fontSize}px`}} */
    /* style={{ marginLeft: `${fontSize / 2}px` }} */
      style={{
        marginBottom: item.parent_id === null ? `${fontSize}px` : `0`,
        marginLeft: `${fontSize}px`
      }}
    >
      {isEditing ? (
        // Edit input
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          autoFocus
          className="px-2"
          style={{
            fontSize: `${fontSize}px`,
            // paddingTop: `${fontSize / 4}px`,
            // paddingBottom: `${fontSize / 4}px`
          }}
        />
      ) : (
        // Task name and action bar div
        <div
          className={`
            inline-flex 
            items-center 
            leading-tight 
            px-2
            py-1
            cursor-pointer
            hover:bg-task-hover
            ${item.completed ? "line-through text-muted-foreground" : null}
            ${item.highlighted ? "bg-[#f8ff00]" : null}
          `}

          style={{
            fontSize: `${fontSize}px`,
            // paddingTop: `${fontSize / 4}px`,
            // paddingBottom: `${fontSize / 4}px`
          }}

          // Activate or deactivate hovered state when mouse enters or leaves item
          onMouseEnter={(e) => {
            setIsHovered(true)
          }}

          onMouseLeave={(e) => {
            setIsHovered(false)
          }}

          onClick={toggleCompleted}>

          {/* Task Name */}
          <span>{item.name}</span>

          {/* Action Bar */}
          <div className={`
            inline-flex 
            gap-2 
            align-middle 
            ml-2  
            ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}>

            {/* Highlight */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={toggleHighlighted}
              item={item}
              fontSize={fontSize}
              tooltipId="tooltip-highlight"
              tooltipContent="Highlight task"
              icon={PiHighlighterBold}
            />

            {/* Drag and Drop */}
            <ActionButton
              customClasses="cursor-grab"
              dragHandleProps={dragHandleProps}
              item={item}
              fontSize={fontSize}
              tooltipId="tooltip-drag-and-drop"
              tooltipContent="Drag and drop task"
              icon={FiMenu}
            />

            {/* Edit */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={() => setIsEditing(true)}
              item={item}
              fontSize={fontSize}
              tooltipId="tooltip-edit"
              tooltipContent="Edit task"
              icon={FiEdit2}
            />

            {/* Add Sibling 
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
              */}

            {/* Add Child */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={() => onAddSubItem(item)}
              item={item}
              fontSize={fontSize}
              tooltipId="tooltip-add-child"
              tooltipContent="Add child task"
              icon={FiCornerDownRight}
            />

            {/* Delete */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={() => onDelete(item)}
              item={item}
              fontSize={fontSize}
              tooltipId="tooltip-delete"
              tooltipContent="Delete task"
              icon={FiTrash2}
            />
          </div>

        </div>
      )}

      {/* Render any potential child items */}
      {item.items && item.items.length > 0 && (
        <SortableContext
          items={item.items.map(child => child.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="">
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