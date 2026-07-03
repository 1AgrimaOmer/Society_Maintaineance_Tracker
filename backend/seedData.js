const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notice = require('./models/Notice');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notice.deleteMany({});

    console.log('Cleared existing data');

    // Create admin users
    const admin1 = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin',
    });

    const admin2 = await User.create({
      name: 'Super Admin',
      email: 'superadmin@demo.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Created admin users');

    // Create resident users
    const resident1 = await User.create({
      name: 'John Doe',
      email: 'resident1@demo.com',
      password: 'password123',
      role: 'resident',
    });

    const resident2 = await User.create({
      name: 'Jane Smith',
      email: 'resident2@demo.com',
      password: 'password123',
      role: 'resident',
    });

    const resident3 = await User.create({
      name: 'Bob Johnson',
      email: 'resident3@demo.com',
      password: 'password123',
      role: 'resident',
    });

    console.log('Created resident users');

    // Create sample complaints
    const complaint1 = await Complaint.create({
      title: 'Leaking Tap in Bathroom',
      description: 'The tap in the bathroom has been leaking for 2 days now. Water is continuously dripping.',
      category: 'Plumbing',
      status: 'Open',
      priority: 'High',
      createdBy: resident1._id,
      history: [
        {
          status: 'Open',
          updatedBy: resident1._id,
          note: 'Complaint created',
        },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    });

    const complaint2 = await Complaint.create({
      title: 'Light Bulb Not Working',
      description: 'The main light in the hallway is not working. Please replace the bulb.',
      category: 'Electrical',
      status: 'In Progress',
      priority: 'Low',
      createdBy: resident2._id,
      history: [
        {
          status: 'Open',
          updatedBy: resident2._id,
          note: 'Complaint created',
        },
        {
          status: 'In Progress',
          updatedBy: admin1._id,
          note: 'Maintenance staff notified',
        },
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });

    const complaint3 = await Complaint.create({
      title: 'Clogged Drain in Kitchen',
      description: 'The kitchen sink drain is completely clogged. Water is not draining.',
      category: 'Plumbing',
      status: 'Resolved',
      priority: 'Medium',
      createdBy: resident1._id,
      history: [
        {
          status: 'Open',
          updatedBy: resident1._id,
          note: 'Complaint created',
        },
        {
          status: 'In Progress',
          updatedBy: admin1._id,
          note: 'Drain cleaning scheduled',
        },
        {
          status: 'Resolved',
          updatedBy: admin1._id,
          note: 'Drain successfully cleared',
        },
      ],
      resolvedAt: new Date(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    });

    const complaint4 = await Complaint.create({
      title: 'Broken Window in Living Room',
      description: 'The living room window pane is cracked. Needs replacement.',
      category: 'Maintenance',
      status: 'Open',
      priority: 'Medium',
      isOverdue: true,
      createdBy: resident3._id,
      history: [
        {
          status: 'Open',
          updatedBy: resident3._id,
          note: 'Complaint created',
        },
      ],
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    });

    const complaint5 = await Complaint.create({
      title: 'Parking Space Blocked',
      description: 'Someone has parked in my assigned parking space. Please help resolve this.',
      category: 'Parking',
      status: 'In Progress',
      priority: 'Low',
      createdBy: resident2._id,
      history: [
        {
          status: 'Open',
          updatedBy: resident2._id,
          note: 'Complaint created',
        },
        {
          status: 'In Progress',
          updatedBy: admin1._id,
          note: 'Notice sent to other residents',
        },
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    console.log('Created sample complaints');

    // Create sample notices
    const notice1 = await Notice.create({
      title: 'Water Maintenance Schedule',
      message: 'Water maintenance will be done on 20th January from 9 AM to 12 PM. Please store water accordingly.',
      important: true,
      createdBy: admin1._id,
      createdAt: new Date(),
    });

    const notice2 = await Notice.create({
      title: 'Annual General Meeting',
      message: 'The annual general meeting has been scheduled for 25th January at 6 PM in the community hall.',
      important: true,
      createdBy: admin1._id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    const notice3 = await Notice.create({
      title: 'Garbage Collection Update',
      message: 'Garbage collection time has been changed to 7 AM (previously 6 AM). Please keep your garbage ready by 7 AM.',
      important: false,
      createdBy: admin2._id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    });

    console.log('Created sample notices');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Sample Data Created:');
    console.log('- 2 Admin accounts');
    console.log('- 3 Resident accounts');
    console.log('- 5 Sample complaints');
    console.log('- 3 Sample notices\n');
    console.log('Demo Accounts:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Resident: resident1@demo.com / password123');
    console.log('Resident: resident2@demo.com / password123');
    console.log('Resident: resident3@demo.com / password123\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
