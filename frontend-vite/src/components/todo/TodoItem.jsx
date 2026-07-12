import { useEffect, useState } from "react";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { LuPen, LuMove, LuPlus, LuTrash2, LuHighlighter, LuEyeOff, LuRecycle } from "react-icons/lu";

/*
import { FiMenu, FiEdit2, FiTrash2, FiCornerDownRight } from "react-icons/fi";
import { PiHighlighterBold } from "react-icons/pi";
import { BsArrowsCollapse } from "react-icons/bs";
import { FaRecycle } from "react-icons/fa";
*/

import ActionButton from "./ActionButton";
import { SortableTodoItem } from "./SortableTodoItem";

const TodoItem = ({
  level,
  item,
  hoveredItemId,
  setHoveredItemId,
  editingItemId,
  setEditingItemId,
  onCreateUI,
  onCreateDB,
  onUpdate,
  onDelete,
  dragHandleProps
}) => {

  // const [isHovered, setIsHovered] = useState(false);
  // const [isEditing, setIsEditing] = useState(item.isNew);
  const [value, setValue] = useState(item.name);

  const fontSize = 16 + (4 * (level - 1));

  const isHovered = hoveredItemId === item.id;
  const isEditing = editingItemId === item.id;

  // Keyboard shortcuts
  useEffect(() => {
    if (!isHovered || isEditing) return;

    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        // One-time functions
        // edit
        case "e":
          e.preventDefault();
          setEditingItemId(item.id);
          break;

        // drag & drop

        // add child task
        case "c":
          e.preventDefault();
          onCreateUI(item);
          break;

        // delete
        case "x":
          e.preventDefault();
          onDelete(item);
          break;

        // Toggle functions
        // complete
        case " ":
          e.preventDefault();
          toggleCompleted();
          break;

        // highlight
        case "h":
          e.preventDefault();
          toggleHighlighted();
          break;

        // hide child tasks
        case "i":
          e.preventDefault();
          toggleCollapsed();
          break;

        // repeat
        case "r":
          e.preventDefault();
          toggleRecurring();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isHovered, 
    isEditing, 
    // item.id,
    // item.highlighted,
    onUpdate,
    // setEditingItemId
  ]);

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
    if (item.completed) return;

    onUpdate(item, { recurring: item.recurring === null ? 0 : null });
  }

  const handleBlur = () => {
    // setIsEditing(false);
    setEditingItemId(null);

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
          className="px-4 py-1"
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

          onMouseEnter={() => setHoveredItemId(item.id)}

          onMouseLeave={() =>
            // setHoveredItemId(null)

            setHoveredItemId(current =>
              current === item.id ? null : current
            )

          }

          onClick={toggleCompleted}>

          {/* Task name, completed child tasks and recurring counts  */}
          <span className={`
            px-2
            ${item.highlighted && "bg-task-highlight"}  
            ${item.completed && "line-through text-muted-foreground"}
          `}>
            {item.name}

            {item.items?.length > 0 &&
              ` (${calculateCompletedChildTasks(item.items)}/${item.items.length})`
            }

            {item.recurring != null &&
              <span className="ml-2 line-through text-muted-foreground">
                (x{item.recurring})
              </span>
            }
          </span>

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
              // onClickFunction={() => setIsEditing(true)}
              onClickFunction={() => setEditingItemId(item.id)}
              fontSize={fontSize}
              tooltipId="tooltip-edit"
              tooltipContent="edit (e)"
              icon={LuPen}
            />

            {/* Drag and Drop */}
            <ActionButton
              customCursor="cursor-grab"
              dragHandleProps={dragHandleProps}
              fontSize={fontSize}
              tooltipId="tooltip-drag-and-drop"
              tooltipContent="drag & drop"
              icon={LuMove}
            />

            {/* Add Child */}
            <ActionButton
              onClickFunction={() => onCreateUI(item)}
              fontSize={fontSize}
              tooltipId="tooltip-add-child"
              tooltipContent="add child task (c)"
              icon={LuPlus}
            />

            {/* Delete */}
            <ActionButton
              onClickFunction={() => onDelete(item)}
              fontSize={fontSize}
              tooltipId="tooltip-delete"
              tooltipContent="delete (x)"
              icon={LuTrash2}
            />

            {/* Toggles */}
            <span className="mx-2 w-px bg-background" />

            {/* Highlight */}
            <ActionButton
              onClickFunction={toggleHighlighted}
              fontSize={fontSize}
              tooltipId="tooltip-highlight"
              tooltipContent="highlight (h)"
              icon={LuHighlighter}
              isActive={item.highlighted ? true : false}
            />

            {/* Collapse */}
            <ActionButton
              onClickFunction={toggleCollapsed}
              fontSize={fontSize}
              tooltipId="tooltip-collapse"
              tooltipContent="hide child tasks (i)"
              icon={LuEyeOff}
              isActive={item.collapsed ? true : false}
              isDisabled={!item.items?.length}
            />

            {/* Mark as Recurring */}
            <ActionButton
              onClickFunction={toggleRecurring}
              fontSize={fontSize}
              tooltipId="tooltip-recurring"
              tooltipContent="repeat (r)"
              icon={LuRecycle}
              isActive={item.recurring !== null ? true : false}
              isDisabled={item.completed}
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
                hoveredItemId={hoveredItemId}
                setHoveredItemId={setHoveredItemId}
                editingItemId={editingItemId}
                setEditingItemId={setEditingItemId}
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