const express = require('express');
const {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), createNotice);
router.get('/', getNotices);
router.get('/:id', getNotice);
router.put('/:id', authorize('admin'), updateNotice);
router.delete('/:id', authorize('admin'), deleteNotice);

module.exports = router;
