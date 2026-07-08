import { useState } from "react";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { FiMenu, FiEdit2, FiTrash2, FiCornerDownRight } from "react-icons/fi";
import { PiHighlighterBold } from "react-icons/pi";
import { BsArrowsCollapse } from "react-icons/bs";
import { FaRecycle } from "react-icons/fa";

import ActionButton from "./ActionButton";
import { SortableTodoItem } from "./SortableTodoItem";

const TodoItem = ({ level, item, onCreateUI, onCreateDB, onUpdate, onDelete, dragHandleProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);

  const fontSize = 16 + (4 * (level - 1));

  // Item text is clicked (to complete / uncomplete it)
  const toggleCompleted = () => {
    if (item.recurring !== null) {
      onUpdate(item, { recurring: item.recurring + 1 });
    } else {
      onUpdate(item, { completed: !item.completed });
    }
  };

  // Item highlight is toggled
  const toggleHighlighted = () => {
    onUpdate(item, { highlighted: !item.highlighted });
  };

  // Item collapse is toggled
  const toggleCollapsed = () => {
    if (!item.items || item.items.length < 1) return;

    onUpdate(item, { collapsed: !item.collapsed });
  };

  const toggleRecurring = () => {
    onUpdate(item, { recurring: item.recurring === null ? 0 : null });
  }

  const handleBlur = () => {
    setIsEditing(false);

    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      onDelete(item);
      return;
    }

    if (trimmedValue === item.name) {
      return;
    }

    if (item.isNew) {
      onCreateDB({
        ...item,
        name: trimmedValue,
      });

      // item.isNew = false;
    } else {
      onUpdate(item, { name: trimmedValue });
    }
  };

  // Calculate the number of completed tasks in a tasks array
  const calculateCompletedChildTasks = (childTasks) => {
    const completedCount = childTasks.filter(task => task.completed).length;

    // Enforce completion status?
    // completedCount === childTasks.length ? item.completed = true : item.completed = false;

    return completedCount;
  }

  return (
    <div
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          autoFocus
          className="px-2 py-1"
          style={{ fontSize: `${fontSize}px` }}
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
          `}

          style={{ fontSize: `${fontSize}px` }}

          // Activate or deactivate hovered state when mouse enters or leaves item
          onMouseEnter={(e) => {
            setIsHovered(true)
          }}

          onMouseLeave={(e) => {
            setIsHovered(false)
          }}

          onClick={toggleCompleted}>

          {/* Task Name */}
          <span className={`
            px-2
            ${item.completed && "line-through text-muted-foreground"}
            ${item.highlighted && "bg-task-highlight"}
          `}>
            {item.name}

            {item.items && item.items.length > 0 &&
              <span className="ml-2">({calculateCompletedChildTasks(item.items)}/{item.items.length})</span>
            }

            {item.recurring !== null &&
              <span className={`
              ml-2
              ${item.recurring > 0 && "line-through text-muted-foreground"}
            `}>(x{item.recurring})</span>
            }
          </span>

          {/**
          <span className="ml-2">
            {item.items && item.items.length > 0 && `(${calculateCompletedChildTasks(item.items)}/${item.items.length})`}
          </span>
           
          {item.recurring !== null && ` (x${item.recurring})`}
          */}

          {/* Action Bar */}
          <div className={`
            hidden
            sm:inline-flex 
            gap-2 
            align-middle 
            ml-2 
            transition-opacity
            cursor-default
            ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}>
            {/* One-time actions */}

            {/* Edit */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={() => setIsEditing(true)}
              fontSize={fontSize}
              tooltipId="tooltip-edit"
              tooltipContent="Edit task"
              icon={FiEdit2}
            />

            {/* Drag and Drop */}
            <ActionButton
              customClasses="cursor-grab"
              dragHandleProps={dragHandleProps}
              fontSize={fontSize}
              tooltipId="tooltip-drag-and-drop"
              tooltipContent="Drag and drop task"
              icon={FiMenu}
            />

            {/* Add Child */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={() => onCreateUI(item)}
              fontSize={fontSize}
              tooltipId="tooltip-add-child"
              tooltipContent="Add child task"
              icon={FiCornerDownRight}
            />

            {/* Delete */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={() => onDelete(item)}
              fontSize={fontSize}
              tooltipId="tooltip-delete"
              tooltipContent="Delete task"
              icon={FiTrash2}
            />

            {/* Toggles */}
            <div className="mx-2 w-px bg-background" />

            {/* Highlight */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={toggleHighlighted}
              fontSize={fontSize}
              tooltipId="tooltip-highlight"
              tooltipContent="Highlight task"
              icon={PiHighlighterBold}
              isActive={item.highlighted ? true : false}
            />

            {/* Collapse */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={toggleCollapsed}
              fontSize={fontSize}
              tooltipId="tooltip-collapse"
              tooltipContent="Collapse task"
              icon={BsArrowsCollapse}
              isActive={item.collapsed ? true : false}
            />

            {/* Mark as Recurring */}
            <ActionButton
              customClasses="cursor-pointer"
              onClickFunction={toggleRecurring}
              fontSize={fontSize}
              tooltipId="tooltip-recurring"
              tooltipContent="Mark task as recurring"
              icon={FaRecycle}
              isActive={item.recurring !== null ? true : false}
            />
          </div>
        </div>
      )}

      {/* Render any potential child items */}
      {!item.collapsed && item.items && item.items.length > 0 && (
        <SortableContext
          items={item.items.map(child => child.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {item.items.map(child => (
              <SortableTodoItem
                key={child.id}
                item={child}
                level={level - 1}
                onCreateUI={onCreateUI}
                onCreateDB={onCreateDB}
                onUpdate={onUpdate}
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