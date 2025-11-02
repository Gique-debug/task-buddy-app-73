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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeAlarms, setActiveAlarms] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Enregistrer le Service Worker et demander la permission pour les notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      // Enregistrer le Service Worker
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker enregistré:', registration);
        })
        .catch(error => {
          console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
        });

      // Demander la permission pour les notifications
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
          if (permission === 'granted') {
            toast({
              title: "✅ Notifications activées",
              description: "Vous recevrez des rappels même si l'onglet est fermé",
              duration: 3000,
            });
          }
        });
      } else {
        setNotificationPermission(Notification.permission);
      }

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'TASK_NOTIFIED') {
          setTodos(prev =>
            prev.map(todo =>
              todo.id === event.data.todoId ? { ...todo, notified: true } : todo
            )
          );
        }
      });
    }
  }, [toast]);

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

  // Démarrer une alarme répétée pour une tâche
  const startAlarm = useCallback((todoId: string) => {
    // Arrêter l'alarme existante si elle existe
    stopAlarm(todoId);

    // Jouer le son immédiatement
    playNotificationSound();

    // Configurer la répétition toutes les 3 secondes pendant 2 minutes
    let count = 0;
    const maxCount = 40; // 40 * 3 secondes = 2 minutes

    const interval = setInterval(() => {
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        setActiveAlarms(prev => {
          const newMap = new Map(prev);
          newMap.delete(todoId);
          return newMap;
        });
      } else {
        playNotificationSound();
      }
    }, 3000);

    setActiveAlarms(prev => new Map(prev).set(todoId, interval));
  }, [playNotificationSound]);

  // Arrêter l'alarme d'une tâche
  const stopAlarm = useCallback((todoId: string) => {
    setActiveAlarms(prev => {
      const newMap = new Map(prev);
      const interval = newMap.get(todoId);
      if (interval) {
        clearInterval(interval);
        newMap.delete(todoId);
      }
      return newMap;
    });
  }, []);

  // Vérifier les tâches programmées toutes les 10 secondes
  useEffect(() => {
    const checkTasks = async () => {
      const now = new Date();
      
      // Si le Service Worker est disponible, lui envoyer les tâches
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CHECK_SCHEDULED_TASKS',
          todos: todos
        });
      } else {
        // Fallback : vérifier localement si pas de Service Worker
        setTodos(prev => 
          prev.map(todo => {
            if (
              todo.scheduledFor &&
              !todo.notified &&
              !todo.completed &&
              todo.scheduledFor <= now
            ) {
              // Démarrer l'alarme répétée de 2 minutes
              startAlarm(todo.id);
              
              // Afficher la notification native si permission accordée
              if (Notification.permission === 'granted') {
                new Notification('⏰ Rappel de tâche !', {
                  body: todo.text,
                  icon: '/favicon.ico',
                  tag: todo.id,
                });
              }
              
              // Afficher aussi le toast
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
      }
    };

    // Vérifier immédiatement au chargement
    checkTasks();
    
    // Puis vérifier toutes les 10 secondes
    const interval = setInterval(checkTasks, 10000);

    return () => {
      clearInterval(interval);
      // Nettoyer toutes les alarmes actives au démontage
      activeAlarms.forEach(alarm => clearInterval(alarm));
    };
  }, [todos, playNotificationSound, toast, startAlarm, activeAlarms]);

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
    // Arrêter l'alarme si la tâche est cochée
    stopAlarm(id);
    
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const updateTodo = (id: string, text: string, scheduledFor?: Date) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id 
          ? { 
              ...todo, 
              text: text.trim(), 
              scheduledFor,
              notified: false // Réinitialiser la notification si on change la date
            } 
          : todo
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
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};