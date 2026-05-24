# NodeChat Frontend Optimization Notes

## Current system

- **OS:** macOS
- **Runtime:** Node.js + npm
- **Frontend:** vanilla JavaScript, HTML, and CSS
- **Realtime layer:** Socket.IO
- **Server entry:** `index.js`

## Current app layout

- Static assets are served from `public/`
- `public/index.html` contains the full UI shell
- `public/style.css` contains the styling
- `public/client.js` handles auth, rooms, direct messages, and socket events
- API routes are mounted under `/api/v1`

## What is actually implemented

### Authentication
- Email/password register and login
- Google OAuth flow via `/api/v1/auth/google`
- JWT token stored in `localStorage`
- Session restore on page refresh when `token` and `user` exist

### Rooms
- Create rooms
- Browse public rooms
- Join public rooms
- Invite users to private rooms
- Load joined rooms from `/api/v1/rooms`

### Direct messages
- Search for users by email
- Start a DM from the search modal
- Load DM conversations from `/api/v1/dms`
- Open chat history from `/api/v1/messages?receiverId=...`

### Messaging
- Send room messages over Socket.IO
- Send direct messages over Socket.IO
- Receive live messages only for the active chat
- Show connection status in the sidebar

## Current runtime notes

- The server listens on `PORT` when set, otherwise it falls back to `5000`
- The current browser client in `public/client.js` is configured to call `http://localhost:3000`
- For the current client to work without changes, set `PORT=3000` in your `.env`
- If you prefer `5000`, update `public/client.js` to match your server port

## Current environment variables

Use `.env.example` as the baseline:

```env
PORT=3000
MONGO_URI=your-mongodb-connection-string
SALT=your-salt
JWT_SECRET=your-jwt-secret
EXPIRES_IN="7d"
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Performance and maintainability

- No build step is required for this project
- The frontend is lightweight and simple to debug because it is plain JavaScript
- Keep `public/client.js` changes focused to avoid breaking the auth and socket flow
- Avoid adding large inline templates or duplicated DOM logic
- Reuse existing API helpers and toast logic when adding features

## macOS development workflow

1. Open the project in VS Code
2. Create or update `.env` from `.env.example`
3. Run `npm install`
4. Start the server with `npm run dev`
5. Open `http://localhost:3000` in Chrome or Safari

## Deployment notes

- Serve the `public/` directory correctly
- Keep CORS and Socket.IO origins aligned with your deployment domain
- Use HTTPS in production
- Configure MongoDB access and secure secrets
- Add rate limiting and logging if you move beyond local development

## Current checklist

- [x] Auth flows are implemented
- [x] Rooms and public room browsing are implemented
- [x] Direct messaging is implemented
- [x] Socket.IO realtime messaging is implemented
- [x] Session persistence is implemented via `localStorage`
- [x] Google OAuth is implemented when credentials are configured

## Notes

- The current UI is optimized for a small, static frontend and is not a bundled SPA
- The document should be updated again if the frontend moves to a build pipeline or a framework

**Last Updated:** May 2026
