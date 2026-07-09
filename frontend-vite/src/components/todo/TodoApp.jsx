import { useEffect, useState } from "react";
import { createItem, deleteItem, deleteItems, fetchItems, updateItem, updatePositionsInDb } from "../../api/items";

import { deleteItemInTree, getMaxDepth, updateItemInTree, insertItemIntoTree } from "../../utils/treeOperations";
import { findParentArray, replaceArrayInTree } from "../../utils/dragDrop";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableTodoItem } from "./SortableTodoItem";

import { Button } from "../ui/button";

function TodoApp() {
  const [items, setItems] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  // Fetch items from database
  useEffect(() => {
    document.title = "Tasks - Recursr";

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

  // Create a new task item and insert it into the task tree (items)
  const handleItemCreateUI = (parentItem = null) => {
    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: parentItem?.id || null,
      position: parentItem
        ? (parentItem.items?.length ?? 0) + 1
        : items.length + 1,
      isNew: true,
      items: [],
      recurring: null
    };

    setItems(prev =>
      insertItemIntoTree(prev, newItemTemp)
    );
  }

  // Insert a new item into the database and update the UI
  const handleItemCreateDB = async (itemData) => {
    const newItem = await createItem(itemData);

    setItems(prev =>
      updateItemInTree(prev, itemData.id, () => ({
        ...newItem,
        isNew: false
      }))
    );

    /*
    setItems(prev =>
      updateItemInTree(prev, itemData.id, () => newItem)
    );
    */
  }

  // Update item in database, return it and use it to update UI
  const handleItemUpdate = async (item, fieldsToUpdate) => {
    const updatedItem = await updateItem(item.id, fieldsToUpdate);

    setItems(prev =>
      updateItemInTree(prev, item.id, () => updatedItem)
    );
  }

  // Delete item from task tree. Delete it from database too if not new
  const handleItemDelete = async (itemToDelete) => {
    setItems(prevItems => deleteItemInTree(prevItems, itemToDelete.id));

    if (!itemToDelete.isNew) await deleteItem(itemToDelete.id);
  };

  // Delete all items
  const handleResetList = async () => {
    const confirmation = window.confirm("Are you sure you want to reset your list?");

    if (!confirmation) return;

    try {
      await deleteItems();
      const freshItems = await fetchItems();
      setItems(freshItems);
    } catch (error) {
      console.error("Failed to reset list: ", error);
      alert("Could not reset list. Please try again.");
    }
  };

  // Runs when an item is dropped over another
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prevItems => {
      const parentArray = findParentArray(prevItems, active.id);
      if (!parentArray) return prevItems;

      const oldIndex = parentArray.findIndex(i => i.id === active.id);
      const newIndex = parentArray.findIndex(i => i.id === over.id);

      const newArray = arrayMove(parentArray, oldIndex, newIndex);

      // Normalize positions for this level only
      const normalizedArray = newArray.map((item, index) => ({
        ...item,
        position: index + 1
      }));

      // Update the position of each item in the array in the database
      updatePositionsInDb(normalizedArray);

      // Update state
      return replaceArrayInTree(prevItems, parentArray, normalizedArray);
    });
  };

  const treeDepth = getMaxDepth(items);

  return (
    <>
      <div>
        <Button id="new-item-btn" onClick={() => handleItemCreateUI()} variant="center" className="bg-green-600 hover:bg-green-800">
          + Add New Item
        </Button>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="my-4 shadow-sm">
              <ul className="py-4">
                {items.map(item => (
                  <SortableTodoItem
                    key={item.id}
                    level={treeDepth}
                    item={item}
                    onCreateUI={handleItemCreateUI}
                    onCreateDB={handleItemCreateDB}
                    onUpdate={handleItemUpdate}
                    onDelete={handleItemDelete}
                  />
                ))}
              </ul>
            </div>
          </SortableContext>
        </DndContext>

        <Button id="reset-btn" onClick={handleResetList} variant="center" className="bg-yellow-600 hover:bg-yellow-800">
          - Reset List
        </Button>
      </div>
    </>
  );
}

export default TodoApp;
