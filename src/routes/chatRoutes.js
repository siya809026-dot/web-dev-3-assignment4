const router = require('express').Router();
const { getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/:room/messages', protect, getMessages);

module.exports = router;
