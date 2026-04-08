import { useState } from "react";

function EditInput({ initialValue, onBlur }) {
  const [value, setValue] = useState(initialValue);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onBlur(value)}
      onKeyDown={(e) => e.key === "Enter" && onBlur(value)}
      autoFocus
    />
  );
}

export default EditInput;