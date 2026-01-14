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

  /*
  const findItemById = (id, nodes = items) => {
    // Check each node on current level in turn
    for (const node of nodes) {
      // Return node if it matches the id
      if (node.id === id) {
        return node;
      }

      // If not, check its child nodes (if any)
      if (node.items.length > 0) {
        const found = findItemById(id, node.items);

        if (found) {
          return found;
        }
      }
    }

    return null;
  }
  */

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prevItems =>
      moveItem(prevItems, active.id, over.id)
    );
  }

  function moveItem(items, sourceId, targetId) {
    // 1. Remove
    const { items: withoutSource, removedItem } =
      removeItemFromTree(items, sourceId);

    if (!removedItem) return items;

    // 2. Insert
    const updatedTree =
      insertItemBelow(withoutSource, targetId, removedItem);

    return updatedTree;
  }


  function removeItemFromTree(items, idToRemove) {
    let removedItem = null;

    const newItems = items
      .map(item => {
        if (item.id === idToRemove) {
          removedItem = item;
          return null;
        }

        if (item.items) {
          const result = removeItemFromTree(item.items, idToRemove);
          if (result.removedItem) {
            removedItem = result.removedItem;
            return {
              ...item,
              items: result.items
            };
          }
        }

        return item;
      })
      .filter(Boolean);

    return { items: newItems, removedItem };
  }

  function insertItemBelow(items, targetId, itemToInsert) {
    return items.flatMap(item => {
      if (item.id === targetId) {
        return [item, itemToInsert];
      }

      if (item.items) {
        return [{
          ...item,
          items: insertItemBelow(item.items, targetId, itemToInsert)
        }];
      }

      return [item];
    });
  }


  /*
  function handleDragEnd(event) {
    const { active, over } = event;

    console.log("active id: ", active);
    console.log("over id: ", over);

    if (!over || active.id === over.id) return;

    setItems(prevItems => {
      const oldIndex = prevItems.findIndex(i => i.id === active.id); // console.log("old index: ", oldIndex);
      const newIndex = prevItems.findIndex(i => i.id === over.id); // console.log("new index: ", newIndex);
      const newItems = arrayMove(prevItems, oldIndex, newIndex);

      // Optionally recalc `position` after reordering
      return newItems.map((item, index) => ({ ...item, position: index + 1 }));
    });
  }
  
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prevItems =>
      moveItem(prevItems, active.id, over.id)
    );
  }

  // Recursive helper
  function moveItem(tree, activeId, overId) {
    let itemToMove = null;

    // Step 1: remove active item from the tree
    const newTree = tree
      .map(node => {
        if (node.id === activeId) {
          itemToMove = node;
          return null; // remove
        }
        if (node.items?.length) {
          node.items = moveItem(node.items, activeId, overId).tree;
          if (!itemToMove) itemToMove = moveItem(node.items, activeId, overId).itemToMove;
        }
        return node;
      })
      .filter(Boolean);

    if (!itemToMove) return newTree;

    // Step 2: find where to insert
    const insertIndex = newTree.findIndex(n => n.id === overId);

    if (insertIndex !== -1) {
      newTree.splice(insertIndex + 1, 0, itemToMove);
    } else {
      // insert recursively into children if not found at this level
      for (const node of newTree) {
        if (node.items?.length) {
          node.items = moveItem(node.items, activeId, overId).tree;
        }
      }
    }

    // Step 3: recalc positions for this level
    newTree.forEach((n, i) => (n.position = i + 1));

    return newTree;
  }
  */

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
