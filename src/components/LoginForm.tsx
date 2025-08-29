'use client';

import { useState } from 'react';
import { userService } from '@/lib/userService';
import { User } from '@/types/todo';

interface LoginFormProps {
    onLogin: (user: User) => void;
    darkMode: boolean;
}

export default function LoginForm({ onLogin, darkMode }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const user = await userService.loginUser(username.trim());
            userService.setCurrentUser(user);
            onLogin(user);
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className={`max-w-md w-full rounded-lg shadow-lg p-8 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                }`}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Todo App</h1>
                    <p className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Enter your username to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className={`block text-sm font-medium mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'border-gray-300 text-gray-800 placeholder-gray-500'
                                }`}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </div>
                        ) : (
                            'Login / Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className={`text-xs transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        New users will have an account created automatically
                    </p>
                </div>
            </div>
        </div>
    );
}
