# AI Integration Setup Guide

This guide explains how to set up AI integration for the chatbot using OpenAI's GPT models.

## 🤖 OpenAI Integration

### 1. Get OpenAI API Key

1. **Sign up**: Go to [OpenAI Platform](https://platform.openai.com/)
2. **Create API key**: Navigate to API Keys section and create a new key
3. **Copy the key**: Save it securely (you won't see it again)

### 2. Environment Variables

Add this to your `.env.local` file:

```env
# OpenAI API Key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. API Key Security

⚠️ **Important**: The `NEXT_PUBLIC_` prefix means this key will be exposed to the browser. For production:

-   Use server-side API routes instead
-   Implement rate limiting
-   Monitor API usage

## 🚀 Features

### AI-Powered Todo Enhancement

-   **Smart analysis**: AI understands context and intent
-   **Structured responses**: JSON-formatted suggestions
-   **Priority detection**: Automatically identifies important tasks
-   **Related suggestions**: Provides additional todo ideas

### Fallback System

-   **Graceful degradation**: Works without API key
-   **Keyword-based enhancement**: Basic enhancement when AI unavailable
-   **Error handling**: Continues working even if API fails

## 💰 Cost Considerations

### OpenAI Pricing (GPT-3.5-turbo)

-   **Input tokens**: ~$0.0015 per 1K tokens
-   **Output tokens**: ~$0.002 per 1K tokens
-   **Typical cost**: ~$0.01-0.05 per conversation

### Cost Optimization

-   **Token limits**: Set to 500 max tokens
-   **Temperature**: 0.7 for balanced creativity
-   **Caching**: Consider caching common responses

## 🔧 Alternative AI Providers

### 1. Anthropic Claude

```typescript
// Update aiService.ts
private baseUrl: string = 'https://api.anthropic.com/v1/messages';
```

### 2. Local Models (Ollama)

```typescript
// Update aiService.ts
private baseUrl: string = 'http://localhost:11434/api/generate';
```

### 3. Hugging Face

```typescript
// Update aiService.ts
private baseUrl: string = 'https://api-inference.huggingface.co/models/...';
```

## 🧪 Testing

### Test the AI Integration

1. Add your API key to `.env.local`
2. Restart the development server
3. Open the chatbot and try:
    - "I want to learn guitar"
    - "I need to organize my room"
    - "I have a project deadline coming up"

### Expected Behavior

-   **With API key**: Smart, contextual responses with reasoning
-   **Without API key**: Fallback to keyword-based enhancement
-   **API errors**: Graceful fallback with error message

## 🔒 Security Best Practices

### For Production

1. **Server-side API calls**: Move API calls to Next.js API routes
2. **Rate limiting**: Implement request throttling
3. **User quotas**: Limit API usage per user
4. **Monitoring**: Track API usage and costs

### Example Server-Side Implementation

```typescript
// pages/api/ai-enhance.ts
export default async function handler(req, res) {
    // Validate user session
    // Check rate limits
    // Make OpenAI API call
    // Return response
}
```

## 🎯 Customization

### Modify AI Prompts

Edit the system prompts in `aiService.ts`:

```typescript
const systemPrompt = `Your custom prompt here...`;
```

### Add New Enhancement Types

Extend the `fallbackEnhancement` function:

```typescript
if (input.includes("your_keyword")) {
    return {
        title: `Custom: ${userInput}`,
        description: "Your custom description",
        priority: true,
        suggestions: ["Suggestion 1", "Suggestion 2"],
    };
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**

    - Check `.env.local` file
    - Restart development server
    - Verify API key format

2. **"OpenAI API error"**

    - Check API key validity
    - Verify account has credits
    - Check rate limits

3. **Fallback mode always active**
    - API key not being read
    - Network connectivity issues
    - API endpoint changes

### Debug Mode

Add this to see API responses:

```typescript
console.log("AI Response:", response);
console.log("Parsed Response:", parsed);
```

## 📈 Monitoring

### Track Usage

-   Monitor OpenAI dashboard for usage
-   Implement logging for API calls
-   Set up alerts for high usage

### Performance

-   Response times typically 1-3 seconds
-   Consider caching for common requests
-   Implement request queuing for high traffic

## 🎉 Ready to Use!

Once you've added your OpenAI API key, the chatbot will provide:

-   **Intelligent todo suggestions**
-   **Context-aware enhancements**
-   **Smart priority detection**
-   **Related task recommendations**

The AI will make your todo creation much more effective and insightful! 🚀
