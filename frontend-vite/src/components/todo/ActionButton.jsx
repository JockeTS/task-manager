import { Tooltip } from 'react-tooltip';

const ActionButton = ({
  customClasses,
  dragHandleProps,
  onClickFunction,
  fontSize,
  tooltipId,
  tooltipContent,
  icon: Icon,
  isActive = false
}) => {

  return (
    <button
      className={`hover:bg-action-button-hover ${customClasses}`}
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