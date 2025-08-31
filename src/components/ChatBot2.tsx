'use client';

import React, { useState, useRef, useEffect } from 'react';
import { todoService } from '../lib/todoService';
import { aiService } from '../lib/aiService';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    suggestions?: string[];
}

interface ChatBotProps {
    darkMode: boolean;
    onClose: () => void;
    onTodoCreated: () => void;
    onSuggestionGenerated?: (title: string, description: string, priority: boolean) => void;
}

export default function ChatBot({ darkMode, onClose, onTodoCreated, onSuggestionGenerated }: ChatBotProps) {
    // Generate unique message ID
    const generateMessageId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Load saved conversation from localStorage
    const loadSavedConversation = (): Message[] => {
        try {
            const saved = localStorage.getItem('chatbot-conversation');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Convert string timestamps back to Date objects
                return parsed.map((msg: Message & { timestamp: string }) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.error('Error loading saved conversation:', error);
        }

        // Return default welcome message if no saved conversation
        return [{
            id: generateMessageId(),
            text: "Hi! I'm your AI Todo Assistant 🤖\n\nI can help you create better, more detailed todos. Just describe what you want to accomplish and I'll suggest the perfect title, description, and priority level!\n\nTry saying something like:\n• 'I need to organize my room'\n• 'I want to start learning guitar'\n• 'I have a project deadline coming up'",
            isBot: true,
            timestamp: new Date(),
        }];
    };

    const [messages, setMessages] = useState<Message[]>(loadSavedConversation);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Clear conversation function
    const clearConversation = () => {
        const welcomeMessage: Message = {
            id: generateMessageId(),
            text: "Hi! I'm your AI Todo Assistant 🤖\n\nI can help you create better, more detailed todos. Just describe what you want to accomplish and I'll suggest the perfect title, description, and priority level!\n\nTry saying something like:\n• 'I need to organize my room'\n• 'I want to start learning guitar'\n• 'I have a project deadline coming up'",
            isBot: true,
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        saveConversation([welcomeMessage]);
        setInputText('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Save conversation to localStorage
    const saveConversation = (messages: Message[]) => {
        try {
            localStorage.setItem('chatbot-conversation', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    };

    const addMessage = (text: string, isBot: boolean, suggestions?: string[]) => {
        const newMessage: Message = {
            id: generateMessageId(),
            text,
            isBot,
            timestamp: new Date(),
            suggestions,
        };
        setMessages(prev => {
            const updatedMessages = [...prev, newMessage];
            saveConversation(updatedMessages);
            return updatedMessages;
        });
    };

    const enhanceTodoWithAI = async (userInput: string) => {
        try {
            // Use real AI service if available
            if (aiService.isAvailable()) {
                const aiResponse = await aiService.enhanceTodoRequest(userInput);

                const enhancedTodos = [{
                    title: aiResponse.title,
                    description: aiResponse.description,
                    priority: aiResponse.priority
                }];

                // Add additional suggestions from AI
                const suggestions = [
                    "Use this suggestion",
                    "Modify the details",
                    "Make it simpler",
                    "Add more context",
                    ...(aiResponse.suggestions || [])
                ];

                return { enhancedTodos, suggestions, aiResponse };
            } else {
                // Fallback to keyword-based enhancement
                return fallbackEnhancement(userInput);
            }
        } catch (error) {
            console.error('AI enhancement error:', error);
            return fallbackEnhancement(userInput);
        }
    };

    const fallbackEnhancement = (userInput: string) => {
        const suggestions = [
            "Break this down into smaller, specific tasks",
            "Add a deadline or time estimate",
            "Consider what resources you'll need",
            "Think about potential obstacles"
        ];

        const enhancedTodos = [];

        // Simple keyword-based enhancement
        if (userInput.toLowerCase().includes('project') || userInput.toLowerCase().includes('work')) {
            enhancedTodos.push({
                title: `Plan: ${userInput}`,
                description: "Break down project into phases and identify key milestones",
                priority: true
            });
            enhancedTodos.push({
                title: `Research for: ${userInput}`,
                description: "Gather necessary information and resources",
                priority: false
            });
        } else if (userInput.toLowerCase().includes('learn') || userInput.toLowerCase().includes('study')) {
            enhancedTodos.push({
                title: `Study plan: ${userInput}`,
                description: "Create a structured learning schedule with specific goals",
                priority: true
            });
            enhancedTodos.push({
                title: `Practice: ${userInput}`,
                description: "Set aside time for hands-on practice and exercises",
                priority: false
            });
        } else if (userInput.toLowerCase().includes('exercise') || userInput.toLowerCase().includes('workout') || userInput.toLowerCase().includes('fitness')) {
            enhancedTodos.push({
                title: `${userInput} - Start small`,
                description: "Begin with a manageable routine you can stick to consistently",
                priority: true
            });
            enhancedTodos.push({
                title: `Track progress for: ${userInput}`,
                description: "Keep a log of your workouts and improvements",
                priority: false
            });
        } else {
            // Generic enhancement
            enhancedTodos.push({
                title: userInput,
                description: "Enhanced with specific action steps and clear objectives",
                priority: false
            });
        }

        return { enhancedTodos, suggestions };
    };

    const handleSendMessage = async () => {
        const userMessage = inputText.trim();
        if (!userMessage || isLoading) return;

        addMessage(userMessage, false);
        setInputText('');
        setIsLoading(true);

        try {
            // AI enhancement
            const result = await enhanceTodoWithAI(userMessage);
            const { enhancedTodos, suggestions } = result;

            // Simulate thinking time
            await new Promise(resolve => setTimeout(resolve, 1000));

            let responseText = "Great! I've analyzed your request and here are some enhanced todo suggestions:\n\n";

            enhancedTodos.forEach((todo, index) => {
                responseText += `${index + 1}. **${todo.title}**\n`;
                responseText += `   📝 ${todo.description}\n`;
                responseText += `   ${todo.priority ? '🔥 High Priority' : '📋 Normal Priority'}\n\n`;
            });

            // Add AI reasoning if available
            if ('aiResponse' in result && result.aiResponse?.reasoning) {
                responseText += `💡 **AI Reasoning:** ${result.aiResponse.reasoning}\n\n`;
            }

            responseText += "Would you like me to:\n";
            responseText += "• Use this suggestion in your form\n";
            responseText += "• Create all these todos for you\n";
            responseText += "• Modify any of them\n";
            responseText += "• Start over with a different approach";

            addMessage(responseText, true, [
                "Use this suggestion",
                "Create all these todos",
                "Modify the first one",
                "Make them simpler",
                "Add more details"
            ]);

        } catch (error) {
            addMessage("Sorry, I encountered an error while processing your request. Please try again!", true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = async (suggestion: string) => {
        addMessage(suggestion, false);
        setIsLoading(true);

        try {
            if (suggestion.toLowerCase().includes('create')) {
                // Create the enhanced todos
                const lastBotMessage = messages.filter(m => m.isBot).pop();
                if (lastBotMessage) {
                    // Parse todos from the last bot message
                    const todos = [];

                    // Extract the main title from the first numbered item
                    const mainTitleMatch = lastBotMessage.text.match(/^\d+\.\s\*\*(.+?)\*\*/);
                    const mainTitle = mainTitleMatch ? mainTitleMatch[1] : 'Enhanced Todo';

                    // First, try to find numbered steps in the entire text
                    const allText = lastBotMessage.text;
                    const numberedSteps: { number: number; content: string }[] = [];

                    // Split the text into lines and look for numbered steps
                    const lines = allText.split('\n');
                    let foundMainTitle = false;

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();

                        // Skip the main title line
                        if (line.match(/^\d+\.\s\*\*(.+?)\*\*/)) {
                            foundMainTitle = true;
                            continue;
                        }

                        // Look for numbered steps after the main title
                        if (foundMainTitle) {
                            const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);
                            if (stepMatch) {
                                const stepNumber = parseInt(stepMatch[1]);
                                let stepContent = stepMatch[2].trim();

                                // Clean up the content
                                stepContent = stepContent
                                    .replace(/\*\*/g, '') // Remove bold formatting
                                    .replace(/📝\s*/, '') // Remove emoji
                                    .replace(/📋\s*Normal Priority/, '') // Remove priority text
                                    .replace(/🔥\s*High Priority/, '') // Remove priority text
                                    .replace(/💡\s*\*\*AI Reasoning:\*\*.*$/, '') // Remove AI reasoning
                                    .trim();

                                // Skip if it's just the main title or too short
                                if (!stepContent.includes('**') && stepContent.length > 5) {
                                    numberedSteps.push({
                                        number: stepNumber,
                                        content: stepContent
                                    });
                                }
                            }
                        }
                    }

                    // If no numbered steps found on separate lines, try to find them in the main title line
                    if (numberedSteps.length === 0) {
                        const mainTitleLine = lines.find(line => line.match(/^\d+\.\s\*\*(.+?)\*\*/));
                        if (mainTitleLine) {
                            // Extract the part after the main title
                            const afterTitle = mainTitleLine.replace(/^\d+\.\s\*\*(.+?)\*\*\s*/, '');

                            // Look for numbered steps in the remaining text
                            const stepMatches = afterTitle.match(/(\d+)\.\s+([^.\n]+)/g);
                            if (stepMatches) {
                                stepMatches.forEach((match) => {
                                    const stepMatch = match.match(/^(\d+)\.\s+(.+)$/);
                                    if (stepMatch) {
                                        const stepNumber = parseInt(stepMatch[1]);
                                        let stepContent = stepMatch[2].trim();

                                        // Clean up the content
                                        stepContent = stepContent
                                            .replace(/\*\*/g, '') // Remove bold formatting
                                            .replace(/📝\s*/, '') // Remove emoji
                                            .replace(/📋\s*Normal Priority/, '') // Remove priority text
                                            .replace(/🔥\s*High Priority/, '') // Remove priority text
                                            .replace(/💡\s*\*\*AI Reasoning:\*\*.*$/, '') // Remove AI reasoning
                                            .trim();

                                        if (stepContent.length > 5) {
                                            numberedSteps.push({
                                                number: stepNumber,
                                                content: stepContent
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }

                    // Create a todo for each numbered step
                    numberedSteps.forEach((step, index) => {
                        // Create a descriptive title based on the step content
                        const generateTitle = (content: string): string => {
                            // Extract the first meaningful phrase from the content
                            const firstPhrase = content.split('.')[0].trim();

                            // If it's a short, clear action, use it as is
                            if (firstPhrase.length <= 50 && firstPhrase.length > 5) {
                                return firstPhrase;
                            }

                            // If it's longer, extract the main action
                            const words = firstPhrase.split(' ');
                            if (words.length > 8) {
                                // Take the first 6-8 words that form a complete thought
                                const actionWords = words.slice(0, Math.min(8, words.length));
                                return actionWords.join(' ') + (actionWords.length < words.length ? '...' : '');
                            }

                            return firstPhrase;
                        };

                        const todoTitle = generateTitle(step.content);

                        // Add to todos array
                        todos.push({
                            title: todoTitle,
                            description: step.content,
                            priority: index === 0 // First step is priority
                        });
                    });

                    // If no numbered steps found, create a single todo
                    if (todos.length === 0) {
                        // Extract everything between the title and the "Would you like me to" section
                        const textParts = lastBotMessage.text.split('Would you like me to:');
                        if (textParts.length > 0) {
                            const descriptionPart = textParts[0];
                            // Remove the title line and clean up
                            const description = descriptionPart
                                .replace(/^\d+\.\s\*\*.*?\*\*\s*\n?/, '')
                                .replace(/📝\s*/, '')
                                .replace(/📋\s*Normal Priority/, '')
                                .replace(/🔥\s*High Priority/, '')
                                .replace(/💡\s*\*\*AI Reasoning:\*\*.*$/, '')
                                .trim();

                            if (description) {
                                todos.push({
                                    title: mainTitle,
                                    description: description,
                                    priority: lastBotMessage.text.includes('🔥')
                                });
                            }
                        }
                    }

                    // Create todos in the database
                    for (const todo of todos) {
                        await todoService.addTodo(
                            todo.title,
                            todo.description,
                            todo.priority
                        );
                    }

                    onTodoCreated();

                    // Reset the chat to default state
                    const welcomeMessage: Message = {
                        id: generateMessageId(),
                        text: "Hi! I'm your AI Todo Assistant 🤖\n\nI can help you create better, more detailed todos. Just describe what you want to accomplish and I'll suggest the perfect title, description, and priority level!\n\nTry saying something like:\n• 'I need to organize my room'\n• 'I want to start learning guitar'\n• 'I have a project deadline coming up'",
                        isBot: true,
                        timestamp: new Date(),
                    };
                    setMessages([welcomeMessage]);
                    saveConversation([welcomeMessage]);

                    // Close the modal
                    onClose();
                }
            } else if (suggestion.toLowerCase().includes('use this')) {
                // Use the first suggestion to pre-fill the form
                const lastBotMessage = messages.filter(m => m.isBot).pop();
                if (lastBotMessage && onSuggestionGenerated) {
                    // Extract the first todo suggestion
                    const lines = lastBotMessage.text.split('\n');
                    let title = '';
                    let description = '';
                    let priority = false;

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.match(/^\d+\.\s\*\*(.+?)\*\*/)) {
                            title = line.match(/^\d+\.\s\*\*(.+?)\*\*/)![1];
                        } else if (line.includes('📝')) {
                            description = line.replace('📝', '').trim();
                        } else if (line.includes('🔥')) {
                            priority = true;
                        }

                        if (title && description) break;
                    }

                    if (title && description) {
                        onSuggestionGenerated(title, description, priority);
                        onClose();
                        addMessage("Great! I've filled in your todo form with the suggestion. You can now review and add it! 🎉", true);
                    }
                }
            } else if (suggestion.toLowerCase().includes('modify')) {
                addMessage("What would you like to change about the first todo? I can help you adjust the title, description, or priority level.", true, [
                    "Make it more specific",
                    "Add a deadline",
                    "Change priority",
                    "Simplify it"
                ]);
            } else if (suggestion.toLowerCase().includes('simpler')) {
                addMessage("Here's a simpler version:\n\n1. **Start: Your Task**\n   📝 Take the first small step today\n   📋 Normal Priority\n\nWould you like me to create this simplified version?", true, [
                    "Yes, create this simple version",
                    "No, let's add more detail instead"
                ]);
            } else if (suggestion.toLowerCase().includes('start over')) {
                addMessage("No problem! Let's start fresh. What would you like to accomplish? Tell me about your goal or task and I'll help you create the perfect todo!", true);
            } else {
                addMessage("I understand you'd like to explore that option. Can you tell me more about what specifically you'd like to do?", true);
            }
        } catch (error) {
            addMessage("Sorry, something went wrong. Please try again!", true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div>
            <div className='fixed inset-0 bg-black opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm'
                onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className={`w-full max-w-lg h-[700px] rounded-lg shadow-xl border transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                🤖
                            </div>
                            <div>
                                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Todo Assistant
                                    {messages.length > 1 && (
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                                            {messages.length - 1} messages
                                        </span>
                                    )}
                                </h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {isLoading ? 'Thinking...' : messages.length > 1 ? 'Conversation saved' : 'Online'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearConversation}
                                className={`p-1 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                title="Clear conversation"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className={`p-1 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 h-96">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-xs p-3 rounded-lg ${message.isBot
                                    ? darkMode
                                        ? 'bg-gray-700 text-gray-100'
                                        : 'bg-gray-100 text-gray-900'
                                    : 'bg-blue-500 text-white'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    {message.suggestions && (
                                        <div className="mt-2 space-y-1">
                                            {message.suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className={`block w-full text-left text-xs p-2 rounded border transition-colors ${darkMode
                                                        ? 'border-gray-600 hover:bg-gray-600 text-gray-300'
                                                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                                                        }`}
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                    }`}>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe your goal or task..."
                                className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isLoading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
