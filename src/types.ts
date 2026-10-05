export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  tags: string[];
}

export interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  sessions: number;
  mode: 'work' | 'break';
}

export interface AppState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
  selectedTag: string | null;
}
