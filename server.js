// Entry point: loads env, connects DB, starts HTTP + Socket.IO server
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const registerChatSocket = require('./src/sockets/chatSocket');
require('./src/events/listeners'); // registers EventEmitter listeners

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  registerChatSocket(io);
  server.listen(PORT, () => console.log(`[server] running on http://localhost:${PORT}`));
})();
