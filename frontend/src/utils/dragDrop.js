// Find the array that item with itemId belongs to
export const findParentArray = (tree, itemId) => {
  // Check top-level array first
  if (tree.some(i => i.id === itemId)) return tree;

  // Then recurse into nested arrays
  for (let item of tree) {
    if (item.items?.length) {
      const result = findParentArray(item.items, itemId);
      if (result) return result;
    }
  }
  return null;
}

export const replaceArrayInTree = (tree, oldArray, newArray) => {
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

// Return a copy of array, with correct positions
export const updatePositions = (tree) => {
  const updatedPositions = tree.map((item, index) => {

    return { ...item, position: index + 1 };
  });

  return updatedPositions;
}