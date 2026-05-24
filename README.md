# NodeChat

NodeChat is a real-time chat application built with Node.js, Express, MongoDB, and Socket.IO. It supports authentication, public/private rooms, direct messages, and live messaging in a lightweight browser-based UI.

## Features

- Email/password registration and login
- Google OAuth sign-in
- Live real-time messaging with Socket.IO
- Public and private rooms
- Direct messages between users
- User search by email for starting DMs
- Room browsing and room invitations
- Session persistence via local storage in the browser

## Project structure

- `index.js` – starts the HTTP server
- `src/app.js` – Express app configuration
- `src/config/` – environment, database, passport, and Socket.IO setup
- `src/domains/` – route, controller, and service modules for auth, users, rooms, messages, and DMs
- `public/` – static frontend assets (`index.html`, `style.css`, `client.js`)

## Tech stack

- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB via Mongoose
- **Authentication:** JWT + Passport.js (Google OAuth)
- **Frontend:** Vanilla HTML, CSS, and JavaScript

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or remote)

## Environment variables

Create a `.env` file in the project root with the following variables:

```env
PORT=3000
MONGO_URI=your-mongodb-connection-string
SALT=your-salt
JWT_SECRET=your-jwt-secret
EXPIRES_IN=7d
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> The current frontend is configured to call `http://localhost:3000`. If you prefer a different port, update the client accordingly.

## Installation

```bash
npm install
```

## Running locally

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Then open `http://localhost:3000` in your browser.

## How it works

### Server

- `index.js` creates an HTTP server and initializes Socket.IO.
- `src/app.js` mounts the API under `/api/v1`, serves the static frontend from `public/`, and enables session-based authentication.
- `src/config/db.js` connects the app to MongoDB.

### Frontend

- `public/index.html` provides the chat UI shell.
- `public/style.css` contains the styling.
- `public/client.js` handles:
  - auth flows
  - room and DM loading
  - Socket.IO event listeners
  - message rendering
  - room creation and invite flows

### API overview

Main routes are mounted under `/api/v1`:

- `/auth/register` – register a new user
- `/auth/login` – sign in with email/password
- `/auth/google` – initiate Google OAuth
- `/users` – user-related endpoints
- `/rooms` – room listing, creation, and membership operations
- `/dms` – direct message conversation management
- `/messages` – message history and message delivery logic

## Notes

- There is no build step required for the current frontend.
- The app currently uses a static SPA-style browser client rather than a framework.
- For production, make sure your MongoDB connection, CORS configuration, and Socket.IO origins are properly configured for your deployment domain.


