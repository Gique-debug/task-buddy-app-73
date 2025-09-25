export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  notified?: boolean;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}