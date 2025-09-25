import { Trash2, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export const TodoItem = ({ todo, onToggle, onDelete, style }: TodoItemProps) => {
  const isScheduled = todo.scheduledFor && !todo.completed;
  const isPastDue = todo.scheduledFor && isPast(todo.scheduledFor) && !todo.completed;
  const isNotified = todo.notified && !todo.completed;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-card rounded-lg border transition-all duration-300 hover:shadow-md group animate-in fade-in slide-in-from-top-2",
        todo.completed && "opacity-75",
        isPastDue && "border-destructive/50 bg-destructive/5",
        isNotified && "border-amber-500/50 bg-amber-50/50"
      )}
      style={style}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="h-5 w-5 data-[state=checked]:bg-success data-[state=checked]:border-success"
      />
      
      <div className="flex-1 space-y-1">
        <span
          className={cn(
            "text-base transition-all duration-300 block",
            todo.completed
              ? "line-through text-muted-foreground"
              : "text-foreground"
          )}
        >
          {todo.text}
        </span>
        
        {isScheduled && (
          <div className={cn(
            "flex items-center gap-2 text-sm",
            isPastDue ? "text-destructive" : isNotified ? "text-amber-600" : "text-muted-foreground"
          )}>
            {isNotified ? (
              <Bell className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>
              {isPastDue ? "En retard - " : isNotified ? "Notifiée - " : ""}
              {format(todo.scheduledFor!, "PPp", { locale: fr })}
            </span>
          </div>
        )}
      </div>

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