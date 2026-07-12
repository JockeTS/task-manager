import { Tooltip } from 'react-tooltip';

const ActionButton = ({
  customCursor = "",
  dragHandleProps,
  onClickFunction,
  fontSize,
  tooltipId,
  tooltipContent,
  icon: Icon,
  isActive = false,
  isDisabled = false
}) => {

  return (
    <button
      className={`
        ${isDisabled
          ? "cursor-not-allowed text-muted-foreground"
          : customCursor || "cursor-pointer"}
        ${!isDisabled ? "hover:bg-action-button-hover" : ""}
      `}
      {...dragHandleProps?.attributes}
      {...dragHandleProps?.listeners}
      onClick={(event) => {
        if (isDisabled) return;

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
      disabled={isDisabled}
    >

      <Icon />
      <Tooltip id={tooltipId} delayShow={750} />
    </button>
  );
}

export default ActionButton;