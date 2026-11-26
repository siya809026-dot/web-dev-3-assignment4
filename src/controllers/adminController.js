const User = require('../models/User');
const Note = require('../models/Note');

// GET /api/admin/users  (admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id  (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Note.deleteMany({ owner: user._id });
    res.json({ success: true, message: 'User and their notes deleted' });
  } catch (err) { next(err); }
};
