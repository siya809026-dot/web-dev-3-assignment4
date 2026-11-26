const appEvents = require('./appEvents');

appEvents.on('user:signup', (user) =>
  console.log(`[event] user:signup -> ${user.username} (${user.role})`));
appEvents.on('user:login', (user) =>
  console.log(`[event] user:login -> ${user.username}`));
appEvents.on('user:login_failed', (email) =>
  console.warn(`[event] user:login_failed -> ${email}`));
appEvents.on('note:created', (note) =>
  console.log(`[event] note:created -> "${note.title}" by ${note.owner}`));
appEvents.on('note:updated', (note) =>
  console.log(`[event] note:updated -> ${note._id}`));
appEvents.on('note:deleted', (id) =>
  console.log(`[event] note:deleted -> ${id}`));
appEvents.on('chat:connected', (user) =>
  console.log(`[event] chat:connected -> ${user.username}`));
appEvents.on('chat:disconnected', (user) =>
  console.log(`[event] chat:disconnected -> ${user.username}`));
appEvents.on('chat:message', (msg) =>
  console.log(`[event] chat:message -> [${msg.room}] ${msg.username}: ${msg.text}`));
appEvents.on('chat:private', (msg) =>
  console.log(`[event] chat:private -> ${msg.from} -> ${msg.to}: ${msg.text}`));
