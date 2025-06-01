'use client';

import { useEffect, useState } from 'react';
import { fetchTodos, createNewTodo, toggleTodo } from '@/lib/graphql-client';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      console.error('Error in loadTodos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      setError(null);
      const newTodo = await createNewTodo(newTodoTitle);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoTitle('');
    } catch (err) {
      console.error('Error in handleCreateTodo:', err);
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      setError(null);
      const updatedTodo = await toggleTodo(id, !completed);
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error in handleToggleTodo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  if (loading) return <div className="text-center py-4">Loading todos...</div>;
  if (error) return (
    <div className="text-red-500 p-4 bg-red-50 rounded-lg">
      <p className="font-semibold">Error:</p>
      <p>{error}</p>
      <button 
        onClick={loadTodos}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      
      <form onSubmit={handleCreateTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="New todo title"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      {todos.length === 0 ? (
        <p className="text-center text-gray-500">No todos found</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id, todo.completed)}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                  {todo.title}
                </span>
              </div>
              {todo.createdAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(todo.createdAt).toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 