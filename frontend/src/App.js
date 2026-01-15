import { useEffect, useState } from "react";
import { fetchItems, updateItem, createItem, deleteItem, deleteItems } from "./api/items";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import TodoItem from "./components/TodoItem";
import { SortableTodoItem } from "./components/SortableTodoItem";

function App() {
  const [items, setItems] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  // Fetch items from database
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchItems();

        setItems(data);
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };

    loadItems();
  }, []);

  function getMaxDepth(items) {
    if (!items || items.length === 0) return 0;

    return 1 + Math.max(...items.map(item => getMaxDepth(item.items)));
  }

  const handleItemSave = async (savedItemTemp) => {

    const fallbackItems = items;

    // 1. Optimistic update (fine)
    setItems(prevItems =>
      updateItemInTree(prevItems, savedItemTemp.id, item => ({
        ...item,
        ...savedItemTemp
      }))
    );

    try {
      const savedItem = savedItemTemp.isNew
        ? await createItem({
          name: savedItemTemp.name,
          position: savedItemTemp.position,
          parent_id: savedItemTemp.parent_id
        })
        : await updateItem(savedItemTemp);

      // 2. Replace TEMP item using TEMP id
      setItems(prevItems =>
        updateItemInTree(prevItems, savedItemTemp.id, item => ({
          ...item,          // keep children, UI state
          ...savedItem,     // apply DB values
          id: savedItem.id, // IMPORTANT: swap temp id → real id
          isNew: false
        }))
      );
    } catch (error) {
      console.log("Error: ", error);

      setItems(fallbackItems);
      alert("Item could not be saved. Please try again.");
    }
  };

  // Add a new top-level item at the end of items[]
  const addTopItem = () => {

    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: null,
      position: items.length + 1,
      isNew: true
    };

    setItems(prevItems => {
      const newItems = [...prevItems, newItemTemp];

      return newItems;
    });
  };

  // Add a new todo item below the clicked one
  const handleAddSiblingItem = (clickedItem) => {

    // Props for the new item
    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: clickedItem.parent_id,
      position: clickedItem.position + 1,
      isNew: true
    };

    // Add item to UI (onBlur saves it to db)
    setItems(prevItems => {
      const newItems = insertAdjacent(prevItems, clickedItem.id, newItemTemp);

      return newItems;
    });
  }

  const handleAddSubItem = (clickedItem) => {
    const position = clickedItem.items?.length + 1 || 1;

    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: clickedItem.id,
      position,
      isNew: true,
      items: []
    };

    // Do not mutate clickedItem
    const updatedClickedItem = {
      ...clickedItem,
      items: [...(clickedItem.items || []), newItemTemp]
    };

    setItems(prevItems =>
      updateItemInTree(prevItems, clickedItem.id, () => updatedClickedItem)
    );
  };

  // Delete all items
  const handleResetList = async () => {
    const confirmation = window.confirm("Are you sure you want to reset your list?");

    if (!confirmation) return;

    try {
      await deleteItems();
      setItems([]);
    } catch (error) {
      console.error("Failed to reset list: ", error);
      alert("Could not reset list. Please try again.");
    }
  };

  // Insert new item adjacent to (below by default) another item with same parent_id (or null)
  function insertAdjacent(prevItems, targetId, newItem) {
    const targetIndex = prevItems.findIndex(item => item.id === targetId);

    // Check if target among current top-level items (if not, recurse)
    if (targetIndex !== -1) {
      const insertIndex = targetIndex + 1; // Insert item after target (below)

      return [
        ...prevItems.slice(0, insertIndex),
        newItem,
        ...prevItems.slice(insertIndex)
      ];
    } else {
      return prevItems.map(item => {
        if (item.items?.length) {
          return {
            ...item,
            items: insertAdjacent(item.items, targetId, newItem)
          }
        }

        return item;
      });
    }
  };

  const handleItemDelete = async (itemToDelete) => {
    // Save original state in case database update fails
    const fallbackItems = items;

    setItems(prevItems => deleteItemInTree(prevItems, itemToDelete.id));

    // Delete item from database
    try {
      await deleteItem(itemToDelete.id);
    } catch (error) {
      console.error(error);

      setItems(fallbackItems);

      alert("Deletion failed. Please try again.");
    }
  };

  const deleteItemInTree = (items, idToRemove) => {
    // Filter out itemToDelete if on current level
    const filtered = items.filter(item => item.id !== idToRemove);

    // If item was deleted on current level, update positions for top-level items and return them
    if (filtered.length !== items.length) {
      return filtered.map((item, index) => ({
        ...item,
        position: index + 1
      }));
    }

    // If item was not deleted on current level, go a level deeper for each item
    return filtered.map(item => ({
      ...item,
      items: deleteItemInTree(item.items || [], idToRemove)
    }));
  }

  function updateItemInTree(items, idToUpdate, updater) {
    let changed = false;

    const result = items.map(item => {
      if (item.id === idToUpdate) {
        changed = true;
        return { ...item, ...updater(item) };
      }

      if (item.items?.length) {
        const updatedChildren = updateItemInTree(item.items, idToUpdate, updater);

        if (updatedChildren !== item.items) {
          changed = true;
          return { ...item, items: updatedChildren };
        }
      }

      return item;
    })

    return changed ? result : items;
  }

  // Runs when an item is dropped over another
  function handleDragEnd(event) {
    // Get dragged item and target item
    const { active, over } = event;

    // If no target item or active and target are same, return
    if (!over || active.id === over.id) return;

    setItems(prevItems => {
      const parentArray = findParentArray(prevItems, active.id);

      if (!parentArray) return prevItems;

      const oldIndex = parentArray.findIndex(i => i.id === active.id);
      const newIndex = parentArray.findIndex(i => i.id === over.id);

      const newArray = arrayMove(parentArray, oldIndex, newIndex);

      // Replace the changed array in the tree structure
      return replaceArrayInTree(prevItems, parentArray, newArray);
    });
  }

  // Find the array that item with itemId belongs to
  function findParentArray(items, itemId) {
    // Check top-level array first
    if (items.some(i => i.id === itemId)) return items;

    // Then recurse into nested arrays
    for (let item of items) {
      if (item.items?.length) {
        const result = findParentArray(item.items, itemId);
        if (result) return result;
      }
    }
    return null;
  }

  const updatePositions = (array) => {
    const updatedPositions = array.map((item, index) => {

      return { ...item, position: index + 1 };
    });

    return updatedPositions;
  }

  function replaceArrayInTree(tree, oldArray, newArray) {
    // If the tree itself is the array to replace (top-level)
    if (tree === oldArray) {

      return updatePositions(newArray);
    }

    // Look for nested items
    return tree.map(item => {

      // Match
      if (item.items === oldArray) {

        return { ...item, items: updatePositions(newArray) };
      }

      // Keep looking
      if (item.items?.length) {
        return { ...item, items: replaceArrayInTree(item.items, oldArray, newArray) };
      }
      return item;
    });
  }

  const treeDepth = getMaxDepth(items);

  return (
    <main className="content">
      <header>
        <h1 id="title">Recurso - Task Manager</h1>

        <button id="new-item-btn" className="full-width-button" onClick={addTopItem}>
          + Add New Item
        </button>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="list-container">
            <ul className="todo-list">
              {items.map(item => (
                <SortableTodoItem
                  key={item.id}
                  level={treeDepth}
                  item={item}
                  onSave={handleItemSave}
                  onAddSiblingItem={handleAddSiblingItem}
                  onAddSubItem={handleAddSubItem}
                  onDelete={handleItemDelete}
                />
              ))}
            </ul>
          </div>
        </SortableContext>
      </DndContext>

      {/*
      <div className="list-container">
        <ul className="todo-list">
          {items.map((item) => (
            <TodoItem
              key={item.id}
              level={treeDepth}
              item={item}
              onSave={handleItemSave}
              onAddSiblingItem={handleAddSiblingItem}
              onAddSubItem={handleAddSubItem}
              onDelete={handleItemDelete}
            />
          ))}
        </ul>
      </div>
      */}

      <footer>
        <button id="reset-btn" className="full-width-button" onClick={handleResetList}>
          - Reset List
        </button>
      </footer>
    </main>
  );
}

export default App;
