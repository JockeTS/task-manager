import { Tooltip } from 'react-tooltip';

const ActionButton = ({
  customClasses, 
  dragHandleProps,
  onClickFunction, 
  item, 
  fontSize, 
  tooltipId, 
  tooltipContent, 
  icon: Icon
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
      style={{ fontSize: `${fontSize}px`, padding: `${fontSize / 4}px`, backgroundColor: item.highlighted ? "var(--color-action-button-hover)" : "" }}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
    >

      <Icon/>
      <Tooltip id="tooltip-id" delayShow={750} />
    </button>
  );
}

export default ActionButton;