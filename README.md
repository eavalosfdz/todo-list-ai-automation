# Todo List App with Supabase

A beautiful, responsive todo list application built with Next.js, TypeScript, Tailwind CSS, and Supabase for data persistence.

## Features

-   ✅ **Add, edit, and delete todos**
-   ✅ **Mark todos as completed**
-   🌙 **Dark/Light mode toggle**
-   🚩 **Priority todos with flag indicator**
-   📝 **Descriptions for todos**
-   👤 **User authentication with username**
-   🔒 **User-specific todo isolation**
-   📱 **Responsive design**
-   💾 **Data persistence with Supabase**
-   ⚡ **Real-time updates**
-   🎨 **Beautiful UI with smooth transitions**
-   📊 **Progress tracking**
-   🤖 **AI-powered description generation** (via n8n + OpenAI)

## Tech Stack

-   **Frontend**: Next.js 15, React, TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Supabase Auth (ready for future use)
-   **Automation**: n8n workflows
-   **AI Integration**: OpenAI GPT-3.5-turbo

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ai-automation-developer-todo-list
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase project**:

    - Go to [supabase.com](https://supabase.com)
    - Sign up/Login and create a new project
    - Wait for the project to be ready

2. **Create the database table**:
    - Go to your Supabase dashboard
    - Navigate to **SQL Editor**
    - Run the following SQL to create the todos table:

```sql
-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create todos table
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  description TEXT,
  priority BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better performance
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies (for demo purposes)
-- In production, you should implement proper authentication
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow operations for user" ON todos FOR ALL USING (true);
```

3. **Get your Supabase credentials**:
    - Go to **Settings** → **API** in your Supabase dashboard
    - Copy your **Project URL** and **anon public key**

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: n8n AI Integration
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/todo-created-webhook

# Optional: AI Description API Security (for n8n to call your API)
AI_DESCRIPTION_API_KEY=your_secure_api_key_here
```

Replace the values with your actual Supabase credentials.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 👤 User Authentication

This app includes a simple username-based authentication system that allows users to have their own private todo lists.

### How Authentication Works

-   **Username Login**: Users enter a username to access the app
-   **Auto-Creation**: New usernames automatically create new accounts
-   **Session Persistence**: Login state is saved in localStorage
-   **User Isolation**: Each user only sees their own todos
-   **Simple Logout**: Users can logout to clear their session

### Features

-   ✅ **No password required** - just enter a username
-   ✅ **Automatic account creation** for new users
-   ✅ **Session persistence** across browser sessions
-   ✅ **User-specific todo isolation**
-   ✅ **Clean logout functionality**
-   ✅ **Username display** in the app header

## 🤖 AI Integration with n8n

This app includes an optional AI-powered feature that automatically generates detailed descriptions for todos using OpenAI's GPT-3.5-turbo through n8n automation.

### Setup AI Integration

1. **Follow the detailed setup guide**: See [N8N_SETUP.md](./N8N_SETUP.md) for complete instructions
2. **Import the n8n workflow**: Use the provided `n8n-workflow.json` file
3. **Configure environment variables**: Add your OpenAI API key and n8n webhook URL
4. **Activate the workflow**: Start the automation in n8n

### How AI Integration Works

-   **Automatic Trigger**: When a todo is created without a description
-   **AI Processing**: n8n sends the todo title to OpenAI for analysis
-   **Smart Descriptions**: AI generates actionable, context-aware descriptions
-   **Seamless Updates**: Descriptions are automatically added to the todo
-   **Visual Feedback**: Loading indicators show when AI is generating

### Features

-   ✅ **Intelligent descriptions** based on todo titles
-   ✅ **Non-blocking operation** (doesn't slow down todo creation)
-   ✅ **Error handling** with graceful fallbacks
-   ✅ **Visual indicators** during AI processing
-   ✅ **Customizable prompts** for different use cases

## 🔧 API Endpoints

### AI Description API

The app includes a REST API endpoint that n8n can call to update todo descriptions:

**Endpoint**: `POST /api/ai-description`

**Request Body**:

```json
{
    "todoId": 123,
    "description": "AI-generated description text",
    "apiKey": "your_api_key" // Optional for security
}
```

**Response**:

```json
{
    "success": true,
    "message": "Todo description updated successfully",
    "todo": {
        /* updated todo object */
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Health Check**: `GET /api/ai-description`

### Security

-   Optional API key authentication
-   Input validation for required fields
-   Error handling with detailed responses
-   Supabase integration with proper error catching

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── ai-description/
│   │       └── route.ts  # AI description API endpoint
│   ├── page.tsx          # Main todo list component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── LoginForm.tsx     # User authentication component
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   ├── todoService.ts    # Todo CRUD operations
│   ├── userService.ts    # User authentication service
│   ├── n8nService.ts     # n8n webhook integration
│   └── aiDescriptionService.ts # AI description API client
└── types/
    └── todo.ts           # TypeScript type definitions
```

## Features Explained

### Dark Mode

-   Toggle between light and dark themes
-   Smooth transitions between modes
-   Persistent during the session

### Todo Management

-   **Add todos**: Type and press Enter or click Add
-   **Complete todos**: Click the checkbox
-   **Delete todos**: Click the trash icon
-   **View completed**: Click "Completed tasks" to expand/collapse

### Data Persistence

-   All todos are stored in Supabase
-   Real-time updates across sessions
-   Error handling for network issues

## Future Enhancements

-   [ ] User authentication
-   [ ] Todo categories/tags
-   [ ] Due dates and reminders
-   [ ] Bulk operations
-   [ ] Search and filter
-   [ ] Export/import functionality
-   [ ] Real-time collaboration

## Troubleshooting

### Common Issues

1. **"Failed to load todos" error**:

    - Check your Supabase credentials in `.env.local`
    - Ensure the todos table exists in your Supabase database
    - Verify your internet connection

2. **Environment variables not working**:

    - Restart your development server after adding `.env.local`
    - Ensure the file is in the project root
    - Check that variable names start with `NEXT_PUBLIC_`

3. **Database connection issues**:
    - Verify your Supabase project is active
    - Check that RLS policies are configured correctly
    - Ensure the todos table has the correct schema

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes!
