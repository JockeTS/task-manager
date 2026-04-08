// Get max depth (number of levels) of items tree
export const getMaxDepth = (items) => {
  if (!items || items.length === 0) return 0;

  return 1 + Math.max(...items.map(item => getMaxDepth(item.items)));
}

// Insert new item adjacent to (below by default) another item with same parent_id (or null)
export const insertAdjacent = (tree, targetId, newItem) => {
  const targetIndex = tree.findIndex(item => item.id === targetId);

  // Check if target among current top-level items (if not, recurse)
  if (targetIndex !== -1) {
    const insertIndex = targetIndex + 1; // Insert item after target (below)

    return [
      ...tree.slice(0, insertIndex),
      newItem,
      ...tree.slice(insertIndex)
    ];
  } else {
    return tree.map(item => {
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

// Update an item in the tree
export const updateItemInTree = (tree, idToUpdate, updater) => {
  let changed = false;

  const result = tree.map(item => {
    // If item on current level
    if (item.id === idToUpdate) {
      changed = true;
      return { ...item, ...updater(item) };
    }

    // Check current item's items (if not empty) if item itself not a match
    if (item.items?.length) {
      const updatedChildren = updateItemInTree(item.items, idToUpdate, updater);

      if (updatedChildren !== item.items) {
        changed = true;
        return { ...item, items: updatedChildren };
      }
    }

    return item;
  })

  return changed ? result : tree;
}

// Delete an item from items tree
export const deleteItemInTree = (tree, idToRemove) => {
  // Filter out itemToDelete if on current level
  const filtered = tree.filter(item => item.id !== idToRemove);

  // If item was deleted on current level, update positions for top-level items and return them
  if (filtered.length !== tree.length) {
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