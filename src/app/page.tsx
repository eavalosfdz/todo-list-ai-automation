'use client';

import { useState, useEffect } from 'react';
import { TodoItem } from '@/types/todo';
import { todoService } from '@/lib/todoService';

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState(false);

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
    if (newTodo.trim() === '') {
      setTitleError(true);
      setTimeout(() => setTitleError(false), 3000); // Hide error after 3 seconds
      return;
    }

    try {
      setError(null);
      setTitleError(false);
      const todo = await todoService.addTodo(newTodo.trim(), newDescription.trim() || undefined, newPriority);
      setTodos([todo, ...todos]);
      setNewTodo('');
      setNewDescription('');
      setNewPriority(false);
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', err);
    }
  };

  const openEditModal = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTitle(todo.text);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingTodo(null);
    setEditTitle('');
    setEditDescription('');
    setEditPriority(false);
  };

  const saveEdit = async () => {
    if (!editingTodo) return;

    if (editTitle.trim() === '') {
      setTitleError(true);
      setTimeout(() => setTitleError(false), 3000); // Hide error after 3 seconds
      return;
    }

    try {
      setError(null);
      setTitleError(false);
      const updatedTodo = await todoService.editTodo(
        editingTodo.id,
        editTitle.trim(),
        editDescription.trim() || undefined,
        editPriority
      );

      setTodos(todos.map((todo) =>
        todo.id === editingTodo.id ? updatedTodo : todo
      ));
      closeEditModal();
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  };

  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${darkMode
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        } flex items-center justify-center`}>
        <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">Loading todos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode
      ? 'bg-gradient-to-br from-gray-900 to-gray-800'
      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      } flex items-center justify-center py-8 px-4`}>
      <div className="max-w-md w-full">
        <div className={`rounded-lg shadow-lg p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
          {/* Header with Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-center flex-1">
              Eduardo&apos;s Todo List
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

          {/* Error Messages */}
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

          {/* Title Required Error Popup */}
          {titleError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Your todo needs a title!
              </div>
            </div>
          )}

          {/* Add Todo Form */}
          <div className="mb-6">
            {/* Todo Details Group */}
            <div className={`border-2 rounded-lg p-4 mb-4 transition-colors duration-200 ${darkMode
              ? 'border-gray-600 bg-gray-700'
              : 'border-gray-300 bg-gray-50'
              }`}>
              <div className="mb-3">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Todo Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Title"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${darkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                />
              </div>

              <div className="mb-3">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Description (Optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Description..."
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none ${darkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                />
              </div>

              {/* Priority Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="priority"
                  checked={newPriority}
                  onChange={(e) => setNewPriority(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="priority" className={`ml-2 text-sm font-medium transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Mark as important
                </label>
              </div>
            </div>

            <button
              onClick={addTodo}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Todo
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
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${todo.priority
                    ? 'border-red-300 bg-red-50'
                    : darkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-300'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`block transition-colors duration-200 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                        } font-medium`}>
                        {todo.text}
                      </span>
                      {todo.priority && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                          </svg>
                          Priority
                        </span>
                      )}
                    </div>
                    {todo.description && (
                      <span className={`block text-sm transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {todo.description}
                      </span>
                    )}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(todo)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none transition-colors p-1 flex-shrink-0"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none transition-colors p-1 flex-shrink-0"
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

                  {/* Circular Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${todo.completed
                      ? 'bg-blue-500 border-blue-500'
                      : todo.priority
                        ? 'border-red-400 hover:border-red-500 bg-white'
                        : darkMode
                          ? 'border-gray-400 hover:border-blue-400'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                  >
                    {todo.completed && (
                      <svg
                        className="absolute inset-0 w-full h-full text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
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
                      className={`flex items-start gap-3 p-4 rounded-lg border opacity-75 transition-colors duration-200 ${todo.priority
                        ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`block line-through transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                            } font-medium`}>
                            {todo.text}
                          </span>
                          {todo.priority && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                              </svg>
                              Priority
                            </span>
                          )}
                        </div>
                        {todo.description && (
                          <span className={`block text-sm line-through transition-colors duration-200 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                            {todo.description}
                          </span>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(todo)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none transition-colors p-1 flex-shrink-0"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none transition-colors p-1 flex-shrink-0"
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

                      {/* Circular Checkbox */}
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${todo.completed
                          ? 'bg-blue-500 border-blue-500'
                          : todo.priority
                            ? 'border-red-400 hover:border-red-500 bg-white dark:bg-gray-800'
                            : darkMode
                              ? 'border-gray-400 hover:border-blue-400'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                      >
                        {todo.completed && (
                          <svg
                            className="absolute inset-0 w-full h-full text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
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

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg shadow-lg p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Todo</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Edit Form */}
            <div className={`border-2 rounded-lg p-4 mb-4 transition-colors duration-200 ${darkMode
              ? 'border-gray-600 bg-gray-700'
              : 'border-gray-300 bg-gray-50'
              }`}>
              <div className="mb-3">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Todo Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyPress={handleEditKeyPress}
                  placeholder="Title"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${darkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                />
              </div>

              <div className="mb-3">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description (Optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyPress={handleEditKeyPress}
                  placeholder="Description..."
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none ${darkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                />
              </div>

              {/* Priority Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-priority"
                  checked={editPriority}
                  onChange={(e) => setEditPriority(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="edit-priority" className={`ml-2 text-sm font-medium transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mark as important
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeEditModal}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors duration-200 ${darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
