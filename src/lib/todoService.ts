import { supabase } from "./supabase";
import { TodoItem } from "@/types/todo";

export const todoService = {
    // Get all todos
    async getTodos(): Promise<TodoItem[]> {
        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching todos:", error);
            throw error;
        }

        return data || [];
    },

    // Add a new todo
    async addTodo(text: string): Promise<TodoItem> {
        const { data, error } = await supabase
            .from("todos")
            .insert([{ text, completed: false }])
            .select()
            .single();

        if (error) {
            console.error("Error adding todo:", error);
            throw error;
        }

        return data;
    },

    // Update a todo (toggle completion)
    async updateTodo(
        id: number,
        updates: Partial<TodoItem>
    ): Promise<TodoItem> {
        const { data, error } = await supabase
            .from("todos")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating todo:", error);
            throw error;
        }

        return data;
    },

    // Delete a todo
    async deleteTodo(id: number): Promise<void> {
        const { error } = await supabase.from("todos").delete().eq("id", id);

        if (error) {
            console.error("Error deleting todo:", error);
            throw error;
        }
    },

    // Toggle todo completion
    async toggleTodo(id: number, completed: boolean): Promise<TodoItem> {
        return this.updateTodo(id, { completed });
    },
};
