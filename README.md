# React Habit Tracker

A modern, minimalistic Task & Habit Tracker built with React, TypeScript, and Vite.

## Features

- 🔐 User authentication (Login/Register)
- ✅ Task management (Create, Toggle, Delete)
- 🎨 Creative and modern Kanban board UI
- 🖱️ **Drag & Drop** - Intuitive task organization
- 🔒 Protected routes with JWT authentication
- 📱 Responsive design
- ⚡ Optimistic updates - instant UI feedback for all operations
- 🏗️ FSD Architecture - scalable and maintainable code structure
- 🔄 React Query - efficient server state management
- 🎯 Visual task status with color-coded columns

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Query (TanStack Query)** - Server state management with optimistic updates
- **@dnd-kit** - Modern drag and drop library
- **FSD Architecture** - Feature-Sliced Design for scalable code organization

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure (FSD Architecture)

```
src/
├── app/                    # Application initialization
│   ├── providers/          # Global providers (React Query)
│   └── App.tsx             # Root component with routing
├── pages/                  # Application pages
│   ├── login/              # Login page
│   ├── register/           # Register page
│   └── tasks/              # Tasks page
├── widgets/                # Complex UI blocks
│   ├── auth-form/          # Authentication form widget
│   └── task-list/          # Task list widget
├── features/               # Business features
│   ├── auth/               # Authentication feature
│   │   ├── api/            # Auth API
│   │   └── model/          # Auth mutations (React Query)
│   └── task-create/        # Task creation feature
├── entities/               # Business entities
│   └── task/               # Task entity
│       ├── api/            # Task API
│       ├── model/          # Task queries & mutations
│       └── ui/             # Task UI components
└── shared/                 # Shared resources
    ├── api/                # Base API client
    ├── lib/                # Utilities (storage)
    ├── ui/                 # Shared UI components
    ├── types/              # TypeScript types
    ├── config/             # Configuration
    └── styles/             # Global styles
```

## API Integration

The app expects a backend API with the following endpoints:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Tasks (Protected)
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `PUT /tasks/{id}/toggle` - Toggle task completion
- `DELETE /tasks/{id}` - Delete task

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8080`)

## License

MIT

