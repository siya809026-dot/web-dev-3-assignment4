const User = require('../models/User');
const { generateToken } = require('../utils/token');
const appEvents = require('../events/appEvents');

const publicUser = (u) => ({ id: u._id, username: u.username, email: u.email, role: u.role });

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, adminKey } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'username, email and password are required' });
    }
    const role = adminKey && adminKey === process.env.ADMIN_SECRET ? 'admin' : 'user';
    const user = await User.create({ username, email, password, role });
    appEvents.emit('user:signup', user);
    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      appEvents.emit('user:login_failed', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    appEvents.emit('user:login', user);
    res.json({ success: true, message: 'Login successful', token: generateToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

// GET /api/auth/profile  (protected)
exports.profile = (req, res) => res.json({ success: true, user: publicUser(req.user) });
