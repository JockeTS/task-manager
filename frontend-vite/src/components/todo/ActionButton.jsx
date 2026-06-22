import { Tooltip } from 'react-tooltip';

const ActionButton = ({
  customClasses,
  dragHandleProps,
  onClickFunction,
  // item,
  fontSize,
  tooltipId,
  tooltipContent,
  icon: Icon,
  isActive = false
}) => {

  return (
    <button
      className={`hover:bg-action-button-hover ${customClasses}`}
      /*
      className={`
        ${isStatic
          ? (item.highlighted ? "bg-green-100 hover:bg-blue-100" : "bg-blue-100 hover:bg-green-100")
          : "hover:bg-action-button-hover"
        }
        ${customClasses}
      `}
      */
      {...dragHandleProps?.attributes}
      {...dragHandleProps?.listeners}
      onClick={(event) => {
        event.stopPropagation();

        if (onClickFunction) {
          onClickFunction();
        }
      }}
      style={{
        fontSize: `${fontSize}px`,
        padding: `${fontSize / 4}px`,
        backgroundColor: isActive ? "var(--color-action-button-hover)" : ""
        /*
        backgroundColor: isStatic
          ? (item.highlighted
            ? "var(--color-action-button-hover)"
            : "var(--color-task-hover)")
          : "var(--color-task-hover)"
        */
      }}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
    >

      <Icon />
      <Tooltip id={tooltipId} delayShow={750} />
    </button>
  );
}

export default ActionButton;