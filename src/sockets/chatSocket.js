const { verifyToken } = require('../utils/token');
const User = require('../models/User');
const Message = require('../models/Message');
const appEvents = require('../events/appEvents');

module.exports = function registerChatSocket(io) {
  const online = new Map(); // userId -> { username, sockets:Set }

  // JWT authentication for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication error: token missing'));
      const user = await User.findById(verifyToken(token).id);
      if (!user) return next(new Error('Authentication error: user not found'));
      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  const onlineList = () => [...online.entries()].map(([id, v]) => ({ id, username: v.username }));

  io.on('connection', (socket) => {
    const { user } = socket;
    const uid = String(user._id);

    if (!online.has(uid)) online.set(uid, { username: user.username, sockets: new Set() });
    online.get(uid).sockets.add(socket.id);
    socket.join(`user:${uid}`); // personal room for private messages
    socket.join('general');

    appEvents.emit('chat:connected', user);
    io.emit('online_users', onlineList());
    socket.emit('system', { message: `Welcome ${user.username}!`, room: 'general' });
    socket.to('general').emit('system', { message: `${user.username} joined`, room: 'general' });

    socket.on('join_room', (room) => {
      if (!room || typeof room !== 'string') return;
      socket.join(room);
      socket.to(room).emit('system', { message: `${user.username} joined ${room}`, room });
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      socket.to(room).emit('system', { message: `${user.username} left ${room}`, room });
    });

    socket.on('send_message', async ({ room = 'general', text } = {}) => {
      if (!text || !String(text).trim()) return;
      try {
        const msg = await Message.create({ room, sender: user._id, username: user.username, text: String(text) });
        const payload = { id: msg._id, room, username: user.username, text: msg.text, createdAt: msg.createdAt };
        io.to(room).emit('receive_message', payload);
        appEvents.emit('chat:message', payload);
      } catch (e) {
        socket.emit('error_message', { message: 'Message could not be sent' });
      }
    });

    socket.on('private_message', ({ toUserId, text } = {}) => {
      if (!toUserId || !text) return;
      const payload = { from: user.username, fromId: uid, to: toUserId, text, createdAt: new Date() };
      io.to(`user:${toUserId}`).emit('private_message', payload);
      socket.emit('private_message', payload);
      appEvents.emit('chat:private', payload);
    });

    socket.on('typing', ({ room = 'general', isTyping = true } = {}) => {
      socket.to(room).emit('typing', { username: user.username, room, isTyping });
    });

    socket.on('disconnect', () => {
      const entry = online.get(uid);
      if (entry) {
        entry.sockets.delete(socket.id);
        if (entry.sockets.size === 0) online.delete(uid);
      }
      appEvents.emit('chat:disconnected', user);
      io.emit('online_users', onlineList());
      socket.to('general').emit('system', { message: `${user.username} left`, room: 'general' });
    });
  });
};
