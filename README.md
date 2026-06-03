# Real-Time Collaborative Editor

A full-stack real-time collaborative document editor built with **React**, **Node.js**, **Express**, **Socket.IO**, **MongoDB**, and **JWT Authentication**.

## Architecture

```
┌─────────────────┐        WebSocket         ┌─────────────────┐
│                 │ ◄──────────────────────► │                 │
│  React Client   │        Socket.IO         │  Express Server │
│  (Vite + TW)    │ ──────────────────────► │  + Socket.IO    │
│                 │        REST API           │                 │
└─────────────────┘                          └────────┬────────┘
                                                      │
                                                      │ Mongoose
                                                      ▼
                                             ┌─────────────────┐
                                             │    MongoDB       │
                                             └─────────────────┘
```

## Tech Stack

| Layer         | Technology                  |
|---------------|----------------------------|
| Frontend      | React, Vite, Tailwind CSS   |
| Backend       | Node.js, Express            |
| Real-time     | Socket.IO                   |
| Database      | MongoDB + Mongoose          |
| Auth          | JWT (jsonwebtoken + bcryptjs)|

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm >= 9

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd real-time-collaborative-editor

# Install all dependencies
npm run install:all
```

### Environment Setup

```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
# - MONGO_URI=mongodb://localhost:27017/collab-editor
# - JWT_SECRET=your-secret-key
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately
npm run dev:backend    # Express on http://localhost:5000
npm run dev:frontend   # Vite on http://localhost:5173
```

## Project Structure

```
├── backend/          # Node.js + Express API server
│   └── src/
│       ├── config/       # Environment, DB, CORS configuration
│       ├── models/       # Mongoose schemas (User, Document)
│       ├── controllers/  # Request handlers
│       ├── routes/       # Express route definitions
│       ├── middleware/    # Auth, validation, error handling
│       ├── services/     # Business logic layer
│       ├── socket/       # Socket.IO event handlers
│       ├── validators/   # Request validation rules
│       └── utils/        # Helpers (logger, errors, async wrapper)
│
├── frontend/         # React + Vite + Tailwind CSS client
│   └── src/
│       ├── api/          # Axios HTTP client & API modules
│       ├── components/   # React components (layout, editor, auth, common)
│       ├── context/      # React Context providers (Auth, Socket)
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Route-level page components
│       ├── styles/       # Tailwind CSS entry & custom styles
│       └── utils/        # Constants & helper functions
│
└── shared/           # Constants shared between client & server
```

## Development Roadmap

1. **Phase 1** — Project scaffold & folder structure ✅
2. **Phase 2** — JWT authentication (register, login, protected routes)
3. **Phase 3** — Document CRUD (create, read, update, delete)
4. **Phase 4** — Real-time collaboration (Socket.IO rooms, content sync)
5. **Phase 5** — Cursor presence (live cursors, active user indicators)
6. **Phase 6** — Yjs CRDT integration (conflict-free editing)

## License

ISC
