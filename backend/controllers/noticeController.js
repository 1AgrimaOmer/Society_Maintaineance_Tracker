const Notice = require('../models/Notice');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @route   POST /api/notices
// @desc    Create a notice
// @access  Private (Admin only)
exports.createNotice = async (req, res) => {
  try {
    const { title, message, important } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Please provide title and message' });
    }

    const notice = await Notice.create({
      title,
      message,
      important: important || false,
      createdBy: req.user._id,
    });

    await notice.populate('createdBy', 'name role');

    // Send email to all residents about the notice
    const residents = await User.find({ role: 'resident' }, 'email');
    residents.forEach((resident) => {
      const emailContent = emailTemplates.noticePosted(
        notice.title,
        notice.message,
        notice.important
      );
      const subject = notice.important ? '🔔 Important Notice' : 'New Notice Posted';
      sendEmail(resident.email, subject, emailContent);
    });

    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/notices
// @desc    Get all notices (important first)
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ important: -1, createdAt: -1 });

    res.status(200).json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/notices/:id
// @desc    Get single notice
// @access  Private
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.status(200).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/notices/:id
// @desc    Update notice
// @access  Private (Admin only)
exports.updateNotice = async (req, res) => {
  try {
    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (req.body.title) notice.title = req.body.title;
    if (req.body.message) notice.message = req.body.message;
    if (req.body.important !== undefined) notice.important = req.body.important;

    notice = await notice.save();
    await notice.populate('createdBy', 'name role');

    res.status(200).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/notices/:id
// @desc    Delete notice
// @access  Private (Admin only)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
