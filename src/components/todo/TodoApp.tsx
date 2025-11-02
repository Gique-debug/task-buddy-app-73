import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { TodoHeader } from './TodoHeader';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';
import { TodoStats } from './TodoStats';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'todo-app-tasks';

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Charger les tâches depuis localStorage au démarrage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Reconvertir les dates en objets Date
        return parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          scheduledFor: todo.scheduledFor ? new Date(todo.scheduledFor) : undefined,
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    }
    return [];
  });
  const { toast } = useToast();

  // Sauvegarder les tâches dans localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tâches:', error);
    }
  }, [todos]);

  // Système de notification sonore
  const playNotificationSound = useCallback(() => {
    // Créer un son de notification simple avec Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  // Vérifier les tâches programmées toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setTodos(prev => 
        prev.map(todo => {
          if (
            todo.scheduledFor &&
            !todo.notified &&
            !todo.completed &&
            todo.scheduledFor <= now
          ) {
            // Jouer le son de notification
            playNotificationSound();
            
            // Afficher la notification toast
            toast({
              title: "⏰ Rappel de tâche !",
              description: todo.text,
              duration: 5000,
            });
            
            return { ...todo, notified: true };
          }
          return todo;
        })
      );
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [playNotificationSound, toast]);

  const addTodo = (text: string, scheduledFor?: Date) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      scheduledFor,
      notified: false,
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const scheduledCount = todos.filter(todo => todo.scheduledFor && !todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl bg-card shadow-lg backdrop-blur-sm border border-border/50 overflow-hidden">
          <TodoHeader />
          <div className="p-6 space-y-6">
            <AddTodo onAdd={addTodo} />
            <TodoStats 
              total={todos.length} 
              active={activeCount} 
              completed={completedCount}
              scheduled={scheduledCount}
            />
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};