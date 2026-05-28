export interface ChecklistCategory {
  id: string;
  storeId: string;
  title: string;
  countDone: number;
  countTotal: number;
  isCompleted: boolean;
}

export interface ChecklistItem {
  id: string;
  storeId: string;
  categoryId: string;
  title: string;
  isCompleted: boolean;
  timeSlot?: string;
}
