const Complaint = require('../models/Complaint');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
exports.getDashboard = async (req, res) => {
  try {
    // Total complaints count
    const totalComplaints = await Complaint.countDocuments();

    // Count by status
    const statusCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Count by category
    const categoryCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Count overdue complaints
    const overdueComplaints = await Complaint.countDocuments({ isOverdue: true });

    // Count by priority
    const priorityCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority category createdAt');

    // Get overdue complaints
    const overduelist = await Complaint.find({ isOverdue: true })
      .sort({ createdAt: -1 })
      .select('title category createdAt createdBy');

    // Count by resident
    const complaintsByResident = await Complaint.aggregate([
      {
        $group: {
          _id: '$createdBy',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          userName: { $arrayElemAt: ['$user.name', 0] },
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const dashboard = {
      totalComplaints,
      overdueComplaints,
      statusCounts: {
        open: statusCounts.find((s) => s._id === 'Open')?.count || 0,
        inProgress: statusCounts.find((s) => s._id === 'In Progress')?.count || 0,
        resolved: statusCounts.find((s) => s._id === 'Resolved')?.count || 0,
      },
      categoryCounts,
      priorityCounts,
      recentComplaints,
      overduelist,
      complaintsByResident,
    };

    res.status(200).json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/check-overdue
// @desc    Check and update overdue complaints
// @access  Private (Admin only)
exports.checkOverdue = async (req, res) => {
  try {
    const { overdueThresholdDays = 7 } = req.body;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    // Find complaints that are not resolved and created before threshold
    const overdue = await Complaint.updateMany(
      {
        status: { $ne: 'Resolved' },
        createdAt: { $lt: thresholdDate },
        isOverdue: false,
      },
      { isOverdue: true }
    );

    // Mark as resolved complaints as not overdue
    await Complaint.updateMany(
      {
        status: 'Resolved',
        isOverdue: true,
      },
      { isOverdue: false }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${overdue.modifiedCount} complaints to overdue`,
      updated: overdue.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
