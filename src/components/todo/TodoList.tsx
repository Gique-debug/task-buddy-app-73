import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList = ({ todos, onToggle, onDelete }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Aucune tâche pour le moment
        </h3>
        <p className="text-sm text-muted-foreground">
          Ajoutez votre première tâche pour commencer !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        />
      ))}
    </div>
  );
};