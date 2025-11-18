export const fetchItems = async () => {
  try {
    const res = await fetch("http://localhost:8000/items");

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    // setItems(data);

    return data;

    // Catch HTTP-level failures and network errors
  } catch (error) {
    console.error("Error fetching items:", error);
  }
};

export const addItem = async (updatedItem) => {
  try {
    const res = await fetch(`http://localhost:8000/items/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: updatedItem.name, position: updatedItem.position })
      // body: JSON.stringify( updatedItem )
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    console.log("Updated item:", data)
  } catch (error) {
    console.error("Error updating item:", error)
  }
};

export const updateItem = async (updatedItem) => {
  try {
    const res = await fetch(`http://localhost:8000/items/${updatedItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: updatedItem.completed, name: updatedItem.name })
      // body: JSON.stringify( updatedItem )
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    console.log("Updated item:", data)
  } catch (error) {
    console.error("Error updating item:", error)
  }
};