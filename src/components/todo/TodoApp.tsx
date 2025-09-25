import { useState } from 'react';
import { Todo } from '@/types/todo';
import { TodoHeader } from './TodoHeader';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';
import { TodoStats } from './TodoStats';

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl bg-card shadow-lg backdrop-blur-sm border border-border/50 overflow-hidden">
          <TodoHeader />
          <div className="p-6 space-y-6">
            <AddTodo onAdd={addTodo} />
            <TodoStats total={todos.length} active={activeCount} completed={completedCount} />
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