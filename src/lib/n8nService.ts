import { TodoItem } from "@/types/todo";

interface N8nWebhookResponse {
    success: boolean;
    message: string;
    todoId: number;
    generatedDescription: string;
    timestamp: string;
}

export const n8nService = {
    /**
     * Trigger AI description generation for a new todo
     * @param todo - The todo item that was created
     * @param n8nWebhookUrl - The n8n webhook URL
     * @returns Promise with the webhook response
     */
    async generateDescription(
        todo: TodoItem,
        n8nWebhookUrl: string
    ): Promise<N8nWebhookResponse> {
        try {
            const response = await fetch(n8nWebhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: todo.id,
                    title: todo.text,
                    description: todo.description || "",
                    priority: todo.priority,
                    completed: todo.completed,
                    created_at: todo.created_at,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error calling n8n webhook:", error);
            throw new Error("Failed to generate AI description");
        }
    },

    /**
     * Check if n8n integration is enabled
     * @returns boolean indicating if n8n webhook URL is configured
     */
    isEnabled(): boolean {
        return !!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    },

    /**
     * Get the n8n webhook URL from environment variables
     * @returns The webhook URL or null if not configured
     */
    getWebhookUrl(): string | null {
        return process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || null;
    },
};
