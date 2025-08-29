interface UpdateDescriptionRequest {
    todoId: number;
    description: string;
    apiKey?: string;
}

interface UpdateDescriptionResponse {
    success: boolean;
    message: string;
    todo?: unknown;
    error?: string;
    timestamp?: string;
}

export const aiDescriptionService = {
    /**
     * Update a todo's description via the AI Description API
     * @param todoId - The ID of the todo to update
     * @param description - The AI-generated description
     * @param apiKey - Optional API key for security
     * @returns Promise with the API response
     */
    async updateDescription(
        todoId: number,
        description: string,
        apiKey?: string
    ): Promise<UpdateDescriptionResponse> {
        try {
            const requestBody: UpdateDescriptionRequest = {
                todoId,
                description,
            };

            // Add API key if provided
            if (apiKey) {
                requestBody.apiKey = apiKey;
            }

            const response = await fetch("/api/ai-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || `HTTP error! status: ${response.status}`
                );
            }

            return data;
        } catch (error) {
            console.error("Error updating todo description:", error);
            throw new Error(
                `Failed to update todo description: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    },

    /**
     * Health check for the AI Description API
     * @returns Promise with the health check response
     */
    async healthCheck(): Promise<unknown> {
        try {
            const response = await fetch("/api/ai-description", {
                method: "GET",
            });

            return await response.json();
        } catch (error) {
            console.error("Error checking API health:", error);
            throw new Error("Failed to check API health");
        }
    },
};
