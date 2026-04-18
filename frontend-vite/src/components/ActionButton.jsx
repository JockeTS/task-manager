const ActionButton = ({ onClick, fontSize }) => {
  return (
    <button
      className="action-button"
      onClick={(event) => {
        event.stopPropagation();
        onClick;
      }}
      style={{ fontSize: `${fontSize}px`, color: "green" }}
      data-tooltip-id="tooltip-add-sibling"
      data-tooltip-content="Add sibling task"
    >
      <FiPlus />
      <Tooltip id="tooltip-add-sibling" delayShow={750} />
    </button>
  )
}

export default ActionButton;