const router = require('express').Router();
const { getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin')); // RBAC
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
