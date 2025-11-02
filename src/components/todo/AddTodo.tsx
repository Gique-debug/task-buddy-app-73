import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { todoSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface AddTodoProps {
  onAdd: (text: string, scheduledFor?: Date) => void;
}

export const AddTodo = ({ onAdd }: AddTodoProps) => {
  const [text, setText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [showScheduling, setShowScheduling] = useState(false);
  const { toast } = useToast();

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
    
    onAdd(text, scheduledFor);
    setText('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setShowScheduling(false);
  };

  const resetScheduling = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setShowScheduling(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          className="flex-1 h-12 text-base border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          maxLength={500}
        />
        
        <Button
          type="button"
          variant={showScheduling ? "default" : "outline"}
          size="lg"
          className="h-12 px-4"
          onClick={() => setShowScheduling(!showScheduling)}
        >
          <Clock className="h-5 w-5" />
        </Button>
        
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
          disabled={!text.trim()}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {showScheduling && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/30 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-medium text-foreground">
            Programmer cette tâche (optionnel)
          </h3>
          
          <div className="flex gap-4 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button
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
                Annuler
              </Button>
            )}
          </div>
          
          {selectedDate && selectedTime && (
            <div className="text-sm text-primary">
              📅 Rappel programmé le {format(selectedDate, "PPP", { locale: fr })} à {selectedTime}
            </div>
          )}
        </div>
      )}
    </div>
  );
};