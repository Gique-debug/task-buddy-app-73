import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';
import { todoSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface EditTodoDialogProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, text: string, scheduledFor?: Date) => void;
}

export const EditTodoDialog = ({ todo, open, onOpenChange, onUpdate }: EditTodoDialogProps) => {
  const [text, setText] = useState(todo.text);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    todo.scheduledFor ? new Date(todo.scheduledFor) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(
    todo.scheduledFor ? format(new Date(todo.scheduledFor), 'HH:mm') : ''
  );
  const { toast } = useToast();

  useEffect(() => {
    setText(todo.text);
    setSelectedDate(todo.scheduledFor ? new Date(todo.scheduledFor) : undefined);
    setSelectedTime(todo.scheduledFor ? format(new Date(todo.scheduledFor), 'HH:mm') : '');
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    let scheduledFor: Date | undefined = undefined;
    
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledFor = new Date(selectedDate);
      scheduledFor.setHours(hours, minutes, 0, 0);
    }
    
    // Validate input
    const result = todoSchema.safeParse({ text, scheduledFor });
    if (!result.success) {
      toast({
        title: "Erreur de validation",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    onUpdate(todo.id, text, scheduledFor);
    onOpenChange(false);
  };

  const resetScheduling = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Texte de la tâche..."
              className="h-12 text-base"
              autoFocus
              maxLength={500}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Programmer cette tâche (optionnel)
            </h3>
            
            <div className="flex gap-4 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-auto"
                placeholder="Heure"
              />
              
              {(selectedDate || selectedTime) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetScheduling}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Supprimer le rappel
                </Button>
              )}
            </div>
            
            {selectedDate && selectedTime && (
              <div className="text-sm text-primary">
                📅 Rappel programmé le {format(selectedDate, "PPP", { locale: fr })} à {selectedTime}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!text.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};