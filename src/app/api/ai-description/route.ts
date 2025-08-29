import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface AIDescriptionRequest {
    todoId: number;
    description: string;
    apiKey?: string;
}

// This should match the API key you set in your environment variables
const API_KEY = process.env.AI_DESCRIPTION_API_KEY;

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body: AIDescriptionRequest = await request.json();

        // Validate required fields
        if (!body.todoId || !body.description) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields: todoId and description are required",
                },
                { status: 400 }
            );
        }

        // Optional API key validation for security
        if (API_KEY && body.apiKey !== API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid API key",
                },
                { status: 401 }
            );
        }

        // Update the todo with the AI-generated description
        const { data, error } = await supabase
            .from("todos")
            .update({
                description: body.description.trim(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", body.todoId)
            .select()
            .single();

        if (error) {
            console.error("Error updating todo with AI description:", error);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to update todo in database",
                    details: error.message,
                },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Todo not found",
                },
                { status: 404 }
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Todo description updated successfully",
            todo: data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// Optional: Add GET method for health check
export async function GET() {
    return NextResponse.json({
        success: true,
        message: "AI Description API is running",
        timestamp: new Date().toISOString(),
    });
}
