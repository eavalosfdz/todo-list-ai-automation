'use client';

import { useState, useEffect } from 'react';
import { TodoItem } from '@/types/todo';
import { todoService } from '@/lib/todoService';

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply dark mode to body element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoService.getTodos();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Please check your Supabase connection.');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() !== '') {
      try {
        setError(null);
        const todo = await todoService.addTodo(newTodo.trim());
        setTodos([todo, ...todos]);
        setNewTodo('');
      } catch (err) {
        setError('Failed to add todo. Please try again.');
        console.error('Error adding todo:', err);
      }
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      setError(null);
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = await todoService.toggleTodo(id, !todoToUpdate.completed);
      setTodos(todos.map((todo) =>
        todo.id === id ? updatedTodo : todo
      ));
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      setError(null);
      await todoService.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${darkMode
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        } py-8 px-4`}>
        <div className="max-w-md mx-auto">
          <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">Loading todos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode
      ? 'bg-gradient-to-br from-gray-900 to-gray-800'
      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      } py-8 px-4`}>
      <div className="max-w-md mx-auto">
        <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
          {/* Header with Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-center flex-1">
              Todo List
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                // Sun icon for dark mode
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon for light mode
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right font-bold text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Add Todo Form */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new todo..."
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
            />
            <button
              onClick={addTodo}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Active Todo List */}
          <div className="space-y-3 mb-4">
            {activeTodos.length === 0 && completedTodos.length === 0 ? (
              <p className={`text-center py-8 transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                No todos yet. Add one above!
              </p>
            ) : (
              activeTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${darkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`flex-1 transition-colors duration-200 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Completed Tasks Section */}
          {completedTodos.length > 0 && (
            <div className={`border-t pt-4 transition-colors duration-200 ${darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`w-full flex items-center justify-between text-sm transition-colors duration-200 ${darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <span>Completed tasks ({completedTodos.length})</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showCompleted ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showCompleted && (
                <div className="mt-3 space-y-2">
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border opacity-75 transition-colors duration-200 ${darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`flex-1 line-through transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {todos.length > 0 && (
            <div className={`mt-6 pt-4 border-t transition-colors duration-200 ${darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
              <div className={`flex justify-between text-sm transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                <span>
                  {activeTodos.length} remaining
                </span>
                <span>
                  {completedTodos.length} completed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
