export interface TodoItem {
    id: number;
    text: string;
    description?: string;
    priority: boolean;
    completed: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Database {
    public: {
        Tables: {
            todos: {
                Row: {
                    id: number;
                    text: string;
                    description: string | null;
                    priority: boolean;
                    completed: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    text: string;
                    description?: string | null;
                    priority?: boolean;
                    completed?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    text?: string;
                    description?: string | null;
                    priority?: boolean;
                    completed?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
