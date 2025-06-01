'use client';

import { useEffect, useState } from 'react';
import { fetchTodos } from '@/lib/graphql-client';

interface Todo {
  id: string;
  title: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await fetchTodos();
        setTodos(data);
      } catch (err) {
        setError('Failed to load todos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      {todos.length === 0 ? (
        <p>No todos found</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              {todo.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 