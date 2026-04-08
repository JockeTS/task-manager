import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoItem from "./TodoItem";

export function SortableTodoItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: props.item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab"
  };

  return (
    <li ref={setNodeRef} style={style}>
      <TodoItem
        {...props}
        dragHandleProps={{ attributes, listeners }}
      />
    </li>
  );
}
