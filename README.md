# NodeChat

A real-time chat application built with Node.js, Express, MongoDB, and Socket.IO. Supports JWT authentication, Google OAuth, public and private rooms, direct messages, and live messaging in a lightweight browser-based UI.

**Live:** [https://nodechat-svq1.onrender.com](https://nodechat-svq1.onrender.com)

---

## Features

- Email/password registration and login
- Google OAuth sign-in
- Real-time messaging with Socket.IO
- Public and private rooms
- Direct messages between users
- User search by email for starting DMs
- Room browsing and room invitations
- Session persistence via localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Real-time | Socket.IO |
| Database | MongoDB via Mongoose |
| Authentication | JWT + Passport.js (Google OAuth) |
| Frontend | Vanilla HTML, CSS, JavaScript |

---

## Project Structure

```
nodechat/
├── index.js                  # HTTP server entry point
├── public/                   # Static frontend
│   ├── index.html
│   ├── style.css
│   └── client.js
└── src/
    ├── app.js                # Express app configuration
    ├── config/
    │   ├── db.js             # MongoDB connection
    │   ├── env.js            # Environment variables
    │   ├── passport.js       # Google OAuth strategy
    │   └── socket.js         # Socket.IO setup
    ├── domains/
    │   ├── auth/             # register, login, Google OAuth
    │   ├── messages/         # message history and delivery
    │   ├── rooms/            # room creation, membership, invites
    │   └── users/            # user search
    ├── middleware/
    │   ├── authMiddleware.js # JWT verification
    │   └── errorHandler.js  # global error handler
    ├── models/
    │   ├── User.js
    │   ├── Message.js
    │   └── Room.js
    └── route/
        └── route.js          # central router
```

---

## API Overview

All routes are mounted under `/api/v1`:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register with email and password |
| POST | `/auth/login` | — | Login with email and password |
| GET | `/auth/google` | — | Initiate Google OAuth |
| GET | `/auth/google/callback` | — | Google OAuth callback |
| GET | `/users/search?email=` | ✓ | Find user by email |
| GET | `/rooms` | ✓ | List public rooms |
| POST | `/rooms` | ✓ | Create a room |
| POST | `/rooms/:id/join` | ✓ | Join a public room |
| POST | `/rooms/:id/invite` | ✓ | Invite user to private room |
| GET | `/messages?room=` | ✓ | Get room message history |
| GET | `/messages?receiverId=` | ✓ | Get DM history |

## Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `join_room` | client → server | Join a room by ID |
| `send_message` | client → server | Send a room or DM message |
| `receive_message` | server → client | Incoming message |
| `room_joined` | server → client | Room join confirmed with history |
| `user_invited` | server → client | Notified when added to a private room |
| `error` | server → client | Error from a socket event |

---

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or Atlas)

---

## Environment Variables

Create a `.env` file at the project root:

```env
PORT=3000
MONGO_URI=your-mongodb-connection-string
SALT=10
JWT_SECRET=your-jwt-secret
EXPIRES_IN=7d
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Running Locally

```bash
# install dependencies
npm install

# development (with nodemon)
npm run dev

# production
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

The app is deployed as a single service on [Render](https://render.com). Express serves the static frontend from `public/` and the API and Socket.IO run on the same server.

### Render Settings

| Setting | Value |
|---|---|
| Build command | `npm install` |
| Start command | `node index.js` |
| Node version | 18+ |

### Required Environment Variables on Render

Same as above, plus:
```
NODE_ENV=production
```

> Do not add `PORT` — Render injects it automatically.

### Google OAuth on Production

Add the following to your authorized redirect URIs in Google Cloud Console:
```
https://nodechat-svq1.onrender.com/api/v1/auth/google/callback
```

---

## Notes

- No build step required — the frontend is plain HTML, CSS, and JavaScript
- Render free tier spins down after 15 minutes of inactivity — first request after spin-down may take ~30 seconds
- For production use, tighten the Socket.IO and Express CORS settings to your specific frontend origin
