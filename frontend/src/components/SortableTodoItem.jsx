import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoItem from "./TodoItem";

export function SortableTodoItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab", // indicates draggable
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoItem {...props} />
    </li>
  );
}
