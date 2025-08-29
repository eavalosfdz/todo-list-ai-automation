export interface User {
    id: number;
    username: string;
    created_at?: string;
}

export interface TodoItem {
    id: number;
    text: string;
    description?: string;
    priority: boolean;
    completed: boolean;
    user_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: number;
                    username: string;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    username: string;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    username?: string;
                    created_at?: string;
                };
            };
            todos: {
                Row: {
                    id: number;
                    text: string;
                    description: string | null;
                    priority: boolean;
                    completed: boolean;
                    user_id: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    text: string;
                    description?: string | null;
                    priority?: boolean;
                    completed?: boolean;
                    user_id: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    text?: string;
                    description?: string | null;
                    priority?: boolean;
                    completed?: boolean;
                    user_id?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
