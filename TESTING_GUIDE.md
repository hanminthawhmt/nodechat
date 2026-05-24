# Testing Guide - NodeChat

## Current system

- **OS:** macOS
- **Runtime:** Node.js + npm
- **Database:** MongoDB (must be reachable from your local environment)
- **Frontend:** vanilla JavaScript served from `public/`

## Prerequisites

- Node.js 18+ and npm installed
- MongoDB running locally or reachable through `MONGO_URI`
- A `.env` file created from `.env.example`

## Local startup

1. Copy `.env.example` to `.env`
2. Set `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`, and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if you want Google auth
3. Set `PORT=3000` if you want the current `public/client.js` API and Socket.IO URLs to match the server
4. Run `npm install`
5. Run `npm run dev`
6. Open `http://localhost:3000`

> If `PORT` is not set, the server falls back to `5000`. In that case, update `public/client.js` to match the server port before testing.

## Quick verification

1. The auth screen loads
2. Register a new user
3. Log in with the same credentials
4. Create or join a room
5. Search for a user and start a DM
6. Send a room message and a DM
7. Refresh the page and confirm session restore works
8. Log out and confirm the app returns to the auth screen

## Authentication testing

### Register
- Open the app
- Switch to **Register**
- Enter name, email, and password
- Submit the form
- Expected: the app enters the main chat UI and the user is stored in `localStorage`

### Login
- Use an existing account
- Submit the form
- Expected: the app enters the main chat UI

### Google OAuth
- Click **Continue with Google**
- Complete the Google sign-in flow
- Expected: the app redirects back to `/` and logs the user in

## Room testing

### Create room
- Click the `+` button in the Rooms section
- Enter a room name
- Choose `public` or `private`
- Expected: the room appears in the list and opens in the chat view

### Browse public rooms
- Click **Browse public rooms**
- Expected: the list of public rooms appears in a modal
- Join a room and confirm it appears in your room list

### Invite user to private room
- Open a private room
- Click the invite button
- Search by email
- Invite a user
- Expected: the invited user receives the room invitation event

## Direct message testing

### Search and start a DM
- Open the DM search modal
- Search for a user by email
- Click **Message**
- Expected: the DM opens in the chat view

### Send DM history
- Send a message
- Refresh the page
- Expected: the conversation is reloaded from the server when the DM is opened again

## Messaging testing

### Room message
- Open a room
- Type a message and send it
- Expected: the message appears immediately in the current chat

### Direct message
- Open a DM
- Send a message
- Expected: the message is sent through Socket.IO and visible in the active chat

### Real-time behavior
- Open the app in two browser tabs
- Send a message from one tab
- Expected: the other tab receives the message in real time

## Session and logout testing

### Session restore
- Log in successfully
- Refresh the page
- Expected: the app restores the session automatically if token data is still available

### Logout
- Click the logout button
- Expected: the app returns to the auth screen and clears `localStorage`

## Error handling testing

### Invalid credentials
- Try submitting wrong email/password
- Expected: an error message appears and the user stays on the auth screen

### Missing fields
- Try registering without a name or leaving fields blank
- Expected: validation prevents submission

### Socket / network issues
- Disconnect the network briefly
- Try sending a message
- Expected: the app shows an error and the connection indicator changes state

## Browser testing

### Desktop
- Chrome or Edge
- Safari
- Firefox

### macOS-specific checks
- Ensure the browser can reach `localhost`
- If Safari blocks local networking, confirm the app is loaded in Chrome or Edge

## API sanity checks

You can confirm the main endpoints manually from the browser or terminal:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/rooms`
- `GET /api/v1/dms`
- `GET /api/v1/users/search?email=test@example.com`
- `GET /api/v1/messages?room=<roomId>`
- `GET /api/v1/messages?receiverId=<userId>`

## Recommended test sequence

1. Confirm the server starts with `npm run dev`
2. Verify the auth flow
3. Verify room creation and room browsing
4. Verify direct messaging
5. Verify realtime messaging in two tabs
6. Verify refresh and logout flow

## Known current constraints

- The frontend uses a hardcoded API URL in `public/client.js`
- The current client assumes the server is reachable on `http://localhost:3000`
- If you change the server port, update the client or set `PORT=3000`

**Last Updated:** May 2026
