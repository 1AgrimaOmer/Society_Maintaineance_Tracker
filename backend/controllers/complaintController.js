const Complaint = require('../models/Complaint');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @route   POST /api/complaints
// @desc    Create a complaint
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const complaintData = {
      title,
      description,
      category,
      createdBy: req.user._id,
      history: [
        {
          status: 'Open',
          updatedBy: req.user._id,
          note: 'Complaint created',
        },
      ],
    };

    if (req.file) {
      complaintData.image = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create(complaintData);
    await complaint.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'history.updatedBy', select: 'name role' },
    ]);

    // Send email to all admins
    const admins = await User.find({ role: 'admin' }, 'email');
    admins.forEach((admin) => {
      const emailContent = emailTemplates.complaintCreated(
        complaint.title,
        complaint._id,
        req.user.name
      );
      sendEmail(admin.email, 'New Complaint Filed', emailContent);
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/complaints
// @desc    Get all complaints (admin) or user's complaints (resident)
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query = {};

    // If resident, only get their complaints
    if (req.user.role === 'resident') {
      query.createdBy = req.user._id;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Filter overdue
    if (req.query.overdue === 'true') {
      query.isOverdue = true;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if user is owner or admin
    if (req.user.role !== 'admin' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/complaints/:id
// @desc    Update complaint status and priority
// @access  Private (Admin only)
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    let statusChanged = false;

    // Add to history if status changed
    if (req.body.status && req.body.status !== complaint.status) {
      complaint.history.push({
        status: req.body.status,
        updatedBy: req.user._id,
        note: req.body.note || '',
      });

      complaint.status = req.body.status;
      statusChanged = true;

      if (req.body.status === 'Resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    // Update priority
    if (req.body.priority) {
      complaint.priority = req.body.priority;
    }

    // Update overdue status
    if (req.body.isOverdue !== undefined) {
      complaint.isOverdue = req.body.isOverdue;
    }

    complaint = await complaint.save();
    await complaint.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'history.updatedBy', select: 'name role' },
    ]);

    // Send email to resident if status changed
    if (statusChanged && complaint.createdBy.email) {
      const emailContent = emailTemplates.complaintStatusUpdated(
        complaint.title,
        complaint.status,
        req.body.note || '',
        complaint.createdBy.name
      );
      sendEmail(complaint.createdBy.email, 'Complaint Status Updated', emailContent);
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/complaints/:id
// @desc    Delete complaint
// @access  Private (Admin or Owner)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Store complaint details before deletion for email
    const complaintTitle = complaint.title;
    const createdByDetails = complaint.createdBy;

    // Delete image if exists
    if (complaint.image) {
      const imagePath = path.join(__dirname, '..', complaint.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);

    // Send email to all admins about deletion
    const admins = await User.find({ role: 'admin' }, 'email name');
    admins.forEach((admin) => {
      const emailContent = emailTemplates.complaintDeleted(
        complaintTitle,
        createdByDetails.name,
        admin.name
      );
      sendEmail(admin.email, 'Complaint Deleted', emailContent);
    });

    res.status(200).json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/complaints/:id/withdraw
// @desc    Withdraw complaint (resident only, keeps history)
// @access  Private (Owner only)
exports.withdrawComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Only owner can withdraw
    if (complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Can only withdraw if not resolved
    if (complaint.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw resolved complaints' });
    }

    // Delete image if exists
    if (complaint.image) {
      const imagePath = path.join(__dirname, '..', complaint.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete complaint
    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Complaint withdrawn and deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
