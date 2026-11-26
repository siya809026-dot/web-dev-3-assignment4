# Lab 4 - Secure Connect and Communication Platform (Web Dev III, Unit 4)

Node.js + Express + JWT + bcrypt + dotenv + Socket.IO + MongoDB (Mongoose), organised in **MVC**.
No auth boilerplate/starter kits used.

## Run
```bash
npm install
cp .env.example .env     # edit secrets if needed
npm start                # MongoDB must be running (MONGO_URI in .env)
```
Open http://localhost:5000 for the chat client.

## Structure (MVC)
```
server.js                 entry: env, DB, HTTP + Socket.IO
src/app.js                Express app, routes, error handling
src/config/db.js          MongoDB connection
src/models/               M - User, Note, Message
src/controllers/          C - auth, notes, chat, admin
src/routes/               route definitions
src/middleware/           JWT protect, RBAC authorize, error handler
src/events/               EventEmitter + listeners (event-driven features)
src/sockets/chatSocket.js real-time chat (JWT-authenticated Socket.IO)
public/index.html         V - chat client
```

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/signup | public (`adminKey` = ADMIN_SECRET makes an admin) |
| POST | /api/auth/login | public |
| GET | /api/auth/profile | JWT |
| POST/GET | /api/notes | JWT (admin: `?all=true`) |
| GET/PUT/DELETE | /api/notes/:id | JWT (owner or admin) |
| GET | /api/chat/:room/messages | JWT |
| GET | /api/admin/users | admin |
| DELETE | /api/admin/users/:id | admin |

Send token as `Authorization: Bearer <token>`.

## Socket.IO
Connect with `io({ auth: { token } })`.
Client events: `join_room`, `leave_room`, `send_message {room,text}`, `private_message {toUserId,text}`, `typing`.
Server events: `receive_message`, `private_message`, `system`, `online_users`, `typing`.

## EventEmitter events (logged in console)
`user:signup`, `user:login`, `user:login_failed`, `note:created/updated/deleted`, `chat:connected/disconnected/message/private`.

## Quick test (curl)
```bash
curl -X POST localhost:5000/api/auth/signup -H "Content-Type: application/json" -d '{"username":"alice","email":"a@a.com","password":"secret123"}'
curl localhost:5000/api/notes                                   # 401 without token
curl localhost:5000/api/notes -H "Authorization: Bearer <token>" # 200 with token
```
"# web-dev-3-assignment4" 
