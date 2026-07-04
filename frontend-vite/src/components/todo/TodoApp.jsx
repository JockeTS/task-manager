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

  /*
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
  */

  const handleAddItem = (parentItem = null) => {
    // Create a new temporary item
    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: null,
      position: items.length + 1,
      isNew: true
    };

    // Include temporary item in items state
    setItems(prevItems => {
      const newItems = [...prevItems, newItemTemp];

      return newItems;
    });
  }

  /*
  const handleAddTopItem = () => {

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

  // Add item as child of clicked item
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
  */

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

  /*
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
  */

  const handleItemCreateDB = async (itemData) => {
    console.log("adding new item to database:", itemData);
    // const newItem = await createItem(itemData);
    await createItem(itemData);
  }

  // Add item as child of clicked item
  const handleItemCreateUI = (clickedItem) => {
    const position = clickedItem.items?.length + 1 || 1;

    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: clickedItem.id,
      position,
      isNew: true,
      items: []
    };

    setItems(prev =>
      insertItemIntoTree(prev, newItemTemp)
    );
  };

  const handleItemCreateUI2 = (parentItem = null) => {
    // Create a new temporary item
    const newItemTemp = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      parent_id: parentItem?.id || null,
      position: parentItem
        ? (parentItem.items?.length ?? 0) + 1
        : items.length + 1,
      isNew: true
    };

    setItems(prev =>
      insertItemIntoTree(prev, newItemTemp)
    );

    /*
    // Include temporary item in items state
    setItems(prevItems => {
      const newItems = [...prevItems, newItemTemp];

      return newItems;
    });
    */
  }

  /*
  const handleItemCreate = async (tempItem) => {
    const newItem = await createItem({
      name: tempItem.name,
      position: tempItem.position,
      parent_id: tempItem.parent_id
    });

    setItems(prev =>
      insertItemIntoTree(prev, newItem)
    );
  }
  */

  // Update item in database, return it and use it to update UI
  const handleItemUpdate = async (item, fieldsToUpdate) => {
    const updatedItem = await updateItem(item.id, fieldsToUpdate);

    setItems(prev =>
      updateItemInTree(prev, item.id, () => updatedItem)
    );
  }

  /*
  const handleItemSave = async (itemId, fieldsToUpdate) => {
    const fallbackItems = items;

    // Optimistic update
    setItems(prevItems =>
      updateItemInTree(prevItems, itemId, item => ({
        ...item,
        ...fieldsToUpdate
      }))
    );

    try {
      const savedItem = await updateItem(itemId, fieldsToUpdate);

      // "real" update (item from database)
      setItems(prevItems =>
        updateItemInTree(prevItems, itemId, item => ({
          ...item,
          ...savedItem
        }))
      );
    } catch (error) {
      console.log("Error: ", error);
      setItems(fallbackItems);
      alert("Item could not be saved. Please try again.");
    }
  };
  */

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
        <Button id="new-item-btn" onClick={() => handleItemCreateUI2()} variant="center" className="bg-green-600 hover:bg-green-800">
          + Add New Item
        </Button>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="my-4 shadow-sm">
              <ul className="p-4">
                {items.map(item => (
                  <SortableTodoItem
                    key={item.id}
                    level={treeDepth}
                    item={item}
                    onCreateUI={() => handleItemCreateUI2(item)}
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
