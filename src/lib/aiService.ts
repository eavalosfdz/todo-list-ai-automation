interface AIResponse {
    title: string;
    description: string;
    priority: boolean;
    suggestions?: string[];
    reasoning?: string;
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export class AIService {
    private apiKey: string;
    private baseUrl: string = "https://api.openai.com/v1/chat/completions";

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
    }

    private async makeRequest(messages: ChatMessage[]): Promise<string> {
        if (!this.apiKey) {
            throw new Error("OpenAI API key not configured");
        }

        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                `OpenAI API error: ${error.error?.message || "Unknown error"}`
            );
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    }

    async enhanceTodoRequest(userInput: string): Promise<AIResponse> {
        const systemPrompt = `You are an AI assistant that helps users create better, more actionable todos. 

Your task is to analyze the user's request and provide:
1. A clear, specific title for the todo
2. A detailed description with actionable steps
3. Whether this should be marked as priority (high priority for time-sensitive, important, or complex tasks)
4. Additional suggestions for related todos

IMPORTANT: When providing steps in the description, always format them as numbered steps like this:
1. First step description
2. Second step description
3. Third step description

Respond in this exact JSON format:
{
  "title": "Clear, specific title",
  "description": "1. First actionable step\\n2. Second actionable step\\n3. Third actionable step",
  "priority": true/false,
  "suggestions": ["Related todo 1", "Related todo 2"],
  "reasoning": "Brief explanation of why you made these choices"
}

Focus on making todos:
- Specific and actionable
- Time-bound when appropriate
- Broken down into manageable steps
- Realistic and achievable
- Always use numbered steps (1., 2., 3., etc.) in the description`;

        const userPrompt = `User request: "${userInput}"

Please analyze this request and create an enhanced todo with the JSON format specified above.`;

        try {
            const response = await this.makeRequest([
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ]);

            // Try to parse JSON response
            try {
                const parsed = JSON.parse(response);
                return {
                    title: parsed.title || userInput,
                    description:
                        parsed.description || "AI-enhanced description",
                    priority: parsed.priority || false,
                    suggestions: parsed.suggestions || [],
                    reasoning: parsed.reasoning || "",
                };
            } catch (parseError) {
                // Fallback if JSON parsing fails
                return this.fallbackEnhancement(userInput, response);
            }
        } catch (error) {
            console.error("AI service error:", error);
            return this.fallbackEnhancement(userInput);
        }
    }

    async chatResponse(
        userMessage: string,
        conversationHistory: ChatMessage[]
    ): Promise<string> {
        const systemPrompt = `You are a helpful AI assistant for a todo list application. You help users create better, more actionable todos.

Your responses should be:
- Friendly and encouraging
- Focused on helping users create better todos
- Provide specific, actionable advice
- Ask clarifying questions when needed

IMPORTANT: When providing todo suggestions with steps, always format them as:
1. **Main Title**
   1. First step description
   2. Second step description
   3. Third step description
   📋 Normal Priority

Keep responses concise but helpful.`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: userMessage },
        ];

        try {
            // Ensure all messages conform to ChatMessage type
            const typedMessages: ChatMessage[] = messages.map((msg) => {
                // If msg already has correct type, return as is
                if (
                    (msg.role === "system" ||
                        msg.role === "user" ||
                        msg.role === "assistant") &&
                    typeof msg.content === "string"
                ) {
                    return msg as ChatMessage;
                }
                // Fallback: coerce role to ChatMessageRole if possible
                let role: "system" | "user" | "assistant" = "user";
                if (
                    msg.role === "system" ||
                    msg.role === "user" ||
                    msg.role === "assistant"
                ) {
                    role = msg.role;
                }
                return {
                    role,
                    content: String(msg.content),
                };
            });
            return await this.makeRequest(typedMessages);
        } catch (error) {
            console.error("Chat AI error:", error);
            return "I'm having trouble connecting to my AI brain right now. Let me help you manually! What kind of todo are you trying to create?";
        }
    }

    private fallbackEnhancement(
        userInput: string,
        aiResponse?: string
    ): AIResponse {
        // Fallback logic when AI is not available
        const input = userInput.toLowerCase();

        if (
            input.includes("exercise") ||
            input.includes("workout") ||
            input.includes("gym")
        ) {
            return {
                title: `Fitness: ${userInput}`,
                description:
                    "Start with a manageable routine. Track your progress and stay consistent for best results.",
                priority: true,
                suggestions: [
                    "Set up a workout schedule",
                    "Track your progress",
                    "Prepare workout clothes",
                ],
                reasoning:
                    "Fitness goals are important for health and require consistency",
            };
        } else if (
            input.includes("learn") ||
            input.includes("study") ||
            input.includes("course")
        ) {
            return {
                title: `Learning: ${userInput}`,
                description:
                    "Break this into small daily sessions. Set specific goals and track your progress.",
                priority: true,
                suggestions: [
                    "Create a study schedule",
                    "Set learning milestones",
                    "Find study resources",
                ],
                reasoning:
                    "Learning requires structured approach and regular practice",
            };
        } else if (input.includes("project") || input.includes("work")) {
            return {
                title: `Project: ${userInput}`,
                description:
                    "Plan phases, set milestones, and identify required resources before starting.",
                priority: true,
                suggestions: [
                    "Break down into phases",
                    "Set deadlines",
                    "Identify resources needed",
                ],
                reasoning:
                    "Learning requires structured approach and regular practice",
            };
        } else {
            return {
                title: userInput,
                description:
                    aiResponse ||
                    "AI-enhanced todo with clear action steps and success criteria.",
                priority: false,
                suggestions: [
                    "Break into smaller tasks",
                    "Set a deadline",
                    "Identify potential obstacles",
                ],
                reasoning: "Generic enhancement for better productivity",
            };
        }
    }

    isAvailable(): boolean {
        return !!this.apiKey;
    }
}

export const aiService = new AIService();
