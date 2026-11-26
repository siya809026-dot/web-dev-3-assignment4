const Message = require('../models/Message');

// GET /api/chat/:room/messages?limit=50   (protected) - chat history
exports.getMessages = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: -1 }).limit(limit);
    res.json({ success: true, count: messages.length, messages: messages.reverse() });
  } catch (err) { next(err); }
};
