import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string, scheduledFor?: Date) => void;
  onDelete: (id: string) => void;
}

export const TodoList = ({ todos, onToggle, onUpdate, onDelete }: TodoListProps) => {
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

  // Trier les tâches : programmées en premier, puis par date de création
  const sortedTodos = [...todos].sort((a, b) => {
    // Les tâches programmées non complétées en premier
    if (a.scheduledFor && !a.completed && (!b.scheduledFor || b.completed)) return -1;
    if (b.scheduledFor && !b.completed && (!a.scheduledFor || a.completed)) return 1;
    
    // Si les deux sont programmées, trier par date programmée
    if (a.scheduledFor && b.scheduledFor && !a.completed && !b.completed) {
      return a.scheduledFor.getTime() - b.scheduledFor.getTime();
    }
    
    // Sinon, trier par date de création (plus récent en premier)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="space-y-2">
      {sortedTodos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
};