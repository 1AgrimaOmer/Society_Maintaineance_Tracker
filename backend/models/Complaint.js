const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    enum: [
      'Plumbing',
      'Electrical',
      'Maintenance',
      'Cleaning',
      'Noise',
      'Parking',
      'Security',
      'Other',
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  image: {
    type: String,
  },
  isOverdue: {
    type: Boolean,
    default: false,
  },
  history: [complaintHistorySchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

// Auto-populate user details
complaintSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'name email role',
  }).populate({
    path: 'history.updatedBy',
    select: 'name role',
  });
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
