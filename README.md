# Todo List App with Supabase

A beautiful, responsive todo list application built with Next.js, TypeScript, Tailwind CSS, and Supabase for data persistence.

## Features

-   ✅ **Add, complete, and delete todos**
-   🌙 **Dark/Light mode toggle**
-   📱 **Responsive design**
-   💾 **Data persistence with Supabase**
-   ⚡ **Real-time updates**
-   🎨 **Beautiful UI with smooth transitions**
-   📊 **Progress tracking**

## Tech Stack

-   **Frontend**: Next.js 15, React, TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Supabase Auth (ready for future use)

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
-- Create todos table
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you should implement proper authentication
CREATE POLICY "Allow all operations" ON todos FOR ALL USING (true);
```

3. **Get your Supabase credentials**:
    - Go to **Settings** → **API** in your Supabase dashboard
    - Copy your **Project URL** and **anon public key**

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main todo list component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   └── todoService.ts    # Todo CRUD operations
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
