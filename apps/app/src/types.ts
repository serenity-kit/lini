type ChecklistItem = {
  text: string;
  checked: boolean;
  position: string;
};

type ChecklistItemWithId = ChecklistItem & {
  id: string;
};
