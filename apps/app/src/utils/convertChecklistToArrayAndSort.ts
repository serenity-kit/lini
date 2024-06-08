export const convertChecklistToArrayAndSort = (items: {
  [key: string]: ChecklistItem;
}) => {
  const result: ChecklistItemWithId[] = Object.keys(items).map((key) => ({
    id: key,
    ...items[key],
  }));

  result.sort((a, b) => a.position.localeCompare(b.position));

  return result;
};
