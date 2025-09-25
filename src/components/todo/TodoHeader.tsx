import { CheckCircle2 } from 'lucide-react';

export const TodoHeader = () => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-glow p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
        <h1 className="text-3xl font-bold text-primary-foreground">
          Gestionnaire de Tâches
        </h1>
      </div>
      <p className="text-primary-foreground/90 text-sm">
        Organisez votre journée avec simplicité
      </p>
    </div>
  );
};