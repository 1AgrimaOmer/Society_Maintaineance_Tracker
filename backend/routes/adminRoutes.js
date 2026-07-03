const express = require('express');
const { getDashboard, checkOverdue } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.put('/check-overdue', checkOverdue);

module.exports = router;
