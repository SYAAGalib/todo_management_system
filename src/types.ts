export interface TaskList {
  id: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  isComplete: boolean;
  deadline: string;
  lists: TaskList[];
  user_id?: string;
}

export type SortOption = 'index' | 'createdDate' | 'completed' | 'deadlineFarthest' | 'deadlineNearest';