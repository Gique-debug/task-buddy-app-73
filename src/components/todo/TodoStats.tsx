interface TodoStatsProps {
  total: number;
  active: number;
  completed: number;
}

export const TodoStats = ({ total, active, completed }: TodoStatsProps) => {
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/30">
      <div className="flex gap-6 text-sm">
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
      </div>

      {completed > 0 && (
        <div className="text-sm text-muted-foreground">
          {Math.round((completed / total) * 100)}% terminé
        </div>
      )}
    </div>
  );
};