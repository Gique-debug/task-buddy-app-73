import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export const AddTodo = ({ onAdd }: AddTodoProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ajouter une nouvelle tâche..."
        className="flex-1 h-12 text-base border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
      />
      <Button
        type="submit"
        size="lg"
        className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
        disabled={!text.trim()}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </form>
  );
};