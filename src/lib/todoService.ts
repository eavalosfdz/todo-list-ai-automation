import { supabase } from "./supabase";
import { TodoItem } from "@/types/todo";
import { n8nService } from "./n8nService";
import { userService } from "./userService";

export const todoService = {
    // Get all todos for current user
    async getTodos(): Promise<TodoItem[]> {
        const userId = userService.getCurrentUserId();
        if (!userId) {
            throw new Error("User not logged in");
        }

        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching todos:", error);
            throw error;
        }

        return data || [];
    },

    // Add a new todo
    async addTodo(
        text: string,
        description?: string,
        priority?: boolean
    ): Promise<TodoItem> {
        const userId = userService.getCurrentUserId();
        if (!userId) {
            throw new Error("User not logged in");
        }

        const { data, error } = await supabase
            .from("todos")
            .insert([
                {
                    text,
                    description: description || null,
                    priority: priority || false,
                    completed: false,
                    user_id: userId,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Error adding todo:", error);
            throw error;
        }

        // Trigger AI description generation if n8n is enabled and no description provided
        if (n8nService.isEnabled() && !description) {
            try {
                const webhookUrl = n8nService.getWebhookUrl();
                if (webhookUrl) {
                    // Trigger AI description generation asynchronously
                    n8nService
                        .generateDescription(data, webhookUrl)
                        .catch((error) => {
                            console.warn(
                                "AI description generation failed:",
                                error
                            );
                        });
                }
            } catch (error) {
                console.warn(
                    "Failed to trigger AI description generation:",
                    error
                );
            }
        }

        return data;
    },

    // Edit a todo
    async editTodo(
        id: number,
        text: string,
        description?: string,
        priority?: boolean
    ): Promise<TodoItem> {
        const { data, error } = await supabase
            .from("todos")
            .update({
                text,
                description: description || null,
                priority: priority || false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error editing todo:", error);
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
