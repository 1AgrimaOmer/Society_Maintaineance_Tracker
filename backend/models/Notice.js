const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
  important: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-populate user details
noticeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'name role',
  });
  next();
});

module.exports = mongoose.model('Notice', noticeSchema);
