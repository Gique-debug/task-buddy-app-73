import { Clock, CheckCircle, Calendar } from 'lucide-react';

interface TodoStatsProps {
  total: number;
  active: number;
  completed: number;
  scheduled?: number;
}

export const TodoStats = ({ total, active, completed, scheduled = 0 }: TodoStatsProps) => {
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/30">
      <div className="flex gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="text-muted-foreground">
            Total: <span className="font-medium text-foreground">{total}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-muted-foreground">
            Actives: <span className="font-medium text-foreground">{active}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-muted-foreground">
            Complétées: <span className="font-medium text-foreground">{completed}</span>
          </span>
        </div>

        {scheduled > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">
              Programmées: <span className="font-medium text-foreground">{scheduled}</span>
            </span>
          </div>
        )}
      </div>

      {completed > 0 && (
        <div className="text-sm text-muted-foreground">
          {Math.round((completed / total) * 100)}% terminé
        </div>
      )}
    </div>
  );
};