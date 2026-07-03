const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  withdrawComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  },
});

const router = express.Router();

router.use(protect);

router.post('/', upload.single('image'), createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaint);
router.put('/:id', authorize('admin'), updateComplaint);
router.put('/:id/withdraw', withdrawComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
