import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface WhatsAppMessage {
    from: string;
    body: string;
    timestamp: string;
}

interface WhatsAppWebhookBody {
    messages?: WhatsAppMessage[];
    contacts?: Array<{ profile: { name: string }; wa_id: string }>;
}

// Webhook verification for WhatsApp
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN =
        process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WhatsApp webhook verified");
        return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
    try {
        const body: WhatsAppWebhookBody = await request.json();

        if (!body.messages || body.messages.length === 0) {
            return NextResponse.json({ status: "no_messages" });
        }

        for (const message of body.messages) {
            await processWhatsAppMessage(message);
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("WhatsApp webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function processWhatsAppMessage(message: WhatsAppMessage) {
    const phoneNumber = message.from;
    const messageBody = message.body.toLowerCase().trim();

    // Find or create user based on phone number
    const user = await findOrCreateUserByPhone(phoneNumber);

    if (!user) {
        await sendWhatsAppMessage(
            phoneNumber,
            "Sorry, I couldn't process your request. Please try again later."
        );
        return;
    }

    // Process different types of messages
    if (messageBody.startsWith("todo:") || messageBody.startsWith("add:")) {
        await handleTodoCreation(phoneNumber, messageBody, user.id);
    } else if (messageBody === "help" || messageBody === "start") {
        await sendHelpMessage(phoneNumber);
    } else if (messageBody === "list" || messageBody === "todos") {
        await sendTodoList(phoneNumber, user.id);
    } else {
        await handleNaturalLanguageRequest(phoneNumber, messageBody, user.id);
    }
}

async function findOrCreateUserByPhone(phoneNumber: string) {
    // First, try to find existing user by phone
    const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phoneNumber)
        .single();

    if (existingUser) {
        return existingUser;
    }

    // Create new user with phone number as username
    const username = `whatsapp_${phoneNumber.replace(/\D/g, "").slice(-10)}`;

    const { data: newUser, error } = await supabase
        .from("users")
        .insert([
            {
                username,
                phone: phoneNumber,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Error creating user:", error);
        return null;
    }

    return newUser;
}

async function handleTodoCreation(
    phoneNumber: string,
    messageBody: string,
    userId: number
) {
    const todoText = messageBody.replace(/^(todo:|add:)\s*/i, "");

    if (!todoText) {
        await sendWhatsAppMessage(
            phoneNumber,
            "Please provide a todo description. Example: 'todo: Buy groceries'"
        );
        return;
    }

    try {
        // Create the todo
        const { data: todo, error } = await supabase
            .from("todos")
            .insert([
                {
                    text: todoText,
                    description: `Created via WhatsApp on ${new Date().toLocaleDateString()}`,
                    priority: false,
                    completed: false,
                    user_id: userId,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        await sendWhatsAppMessage(
            phoneNumber,
            `✅ Todo created successfully!\n\n📝 "${todoText}"\n\nType 'list' to see all your todos or send another 'todo: [description]' to add more.`
        );
    } catch (error) {
        console.error("Error creating todo:", error);
        await sendWhatsAppMessage(
            phoneNumber,
            "Sorry, I couldn't create that todo. Please try again."
        );
    }
}

async function handleNaturalLanguageRequest(
    phoneNumber: string,
    messageBody: string,
    userId: number
) {
    // Enhanced AI-like processing
    const enhancedTodo = await enhanceTodoWithAI(messageBody);

    const response =
        `🤖 I understood your request! Here's what I suggest:\n\n` +
        `📝 *Title:* ${enhancedTodo.title}\n` +
        `💡 *Description:* ${enhancedTodo.description}\n` +
        `${
            enhancedTodo.priority
                ? "🔥 *High Priority*"
                : "📋 *Normal Priority*"
        }\n\n` +
        `Reply with:\n` +
        `• 'yes' to create this todo\n` +
        `• 'modify' to change it\n` +
        `• A new request to start over`;

    await sendWhatsAppMessage(phoneNumber, response);

    // Store the suggestion temporarily (in a real app, you'd use a cache or session)
    // For now, we'll create it directly with a special marker
    await supabase.from("todos").insert([
        {
            text: enhancedTodo.title,
            description: `${enhancedTodo.description}\n\n[Suggested via WhatsApp - confirm to finalize]`,
            priority: enhancedTodo.priority,
            completed: false,
            user_id: userId,
        },
    ]);
}

async function enhanceTodoWithAI(userInput: string) {
    // Simple AI enhancement logic
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
        };
    } else if (input.includes("project") || input.includes("work")) {
        return {
            title: `Project: ${userInput}`,
            description:
                "Plan phases, set milestones, and identify required resources before starting.",
            priority: true,
        };
    } else if (
        input.includes("buy") ||
        input.includes("shop") ||
        input.includes("purchase")
    ) {
        return {
            title: `Shopping: ${userInput}`,
            description:
                "Make a list, set a budget, and check for deals before purchasing.",
            priority: false,
        };
    } else {
        return {
            title: userInput,
            description:
                "AI-enhanced todo with clear action steps and success criteria.",
            priority: false,
        };
    }
}

async function sendTodoList(phoneNumber: string, userId: number) {
    try {
        const { data: todos, error } = await supabase
            .from("todos")
            .select("*")
            .eq("user_id", userId)
            .eq("completed", false)
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!todos || todos.length === 0) {
            await sendWhatsAppMessage(
                phoneNumber,
                "📋 You don't have any active todos yet!\n\nSend 'todo: [description]' to create your first one."
            );
            return;
        }

        let message = "📋 *Your Active Todos:*\n\n";
        todos.forEach((todo, index) => {
            message += `${index + 1}. ${todo.priority ? "🔥 " : ""}${
                todo.text
            }\n`;
            if (todo.description) {
                message += `   💡 ${todo.description.split("\n")[0]}\n`;
            }
            message += "\n";
        });

        message +=
            "💬 Send 'todo: [description]' to add more or 'help' for commands.";

        await sendWhatsAppMessage(phoneNumber, message);
    } catch (error) {
        console.error("Error fetching todos:", error);
        await sendWhatsAppMessage(
            phoneNumber,
            "Sorry, I couldn't fetch your todos. Please try again."
        );
    }
}

async function sendHelpMessage(phoneNumber: string) {
    const helpMessage =
        `🤖 *Todo Assistant Commands:*\n\n` +
        `📝 *Create todos:*\n` +
        `• todo: Buy groceries\n` +
        `• add: Call the doctor\n` +
        `• Just describe what you want to do!\n\n` +
        `📋 *View todos:*\n` +
        `• list - Show active todos\n` +
        `• todos - Same as list\n\n` +
        `❓ *Get help:*\n` +
        `• help - Show this message\n` +
        `• start - Welcome message\n\n` +
        `✨ *Smart features:*\n` +
        `I can understand natural language and suggest improvements to your todos!`;

    await sendWhatsAppMessage(phoneNumber, helpMessage);
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
    // This would integrate with WhatsApp Business API
    // For now, we'll just log it
    console.log(`Sending to ${phoneNumber}: ${message}`);

    // In a real implementation, you'd use WhatsApp Business API:
    /*
  const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber,
      text: { body: message },
    }),
  });
  */
}
