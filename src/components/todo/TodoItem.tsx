import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export const TodoItem = ({ todo, onToggle, onDelete, style }: TodoItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 transition-all duration-300 hover:shadow-md group animate-in fade-in slide-in-from-top-2",
        todo.completed && "opacity-75"
      )}
      style={style}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="h-5 w-5 data-[state=checked]:bg-success data-[state=checked]:border-success"
      />
      
      <span
        className={cn(
          "flex-1 text-base transition-all duration-300",
          todo.completed
            ? "line-through text-muted-foreground"
            : "text-foreground"
        )}
      >
        {todo.text}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};