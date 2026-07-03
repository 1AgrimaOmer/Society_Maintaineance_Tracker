# Society Maintenance Tracker

A full-stack web application for managing society complaints, notices, and maintenance tracking. Built with Node.js, Express.js, MongoDB, and vanilla JavaScript.

## Features

✅ **User Authentication**
- JWT-based authentication
- Role-based access control (Admin & Resident)
- Secure password hashing with bcryptjs

✅ **Complaint Management**
- Residents can create, view, and track complaints
- Admins can view all complaints with filtering
- Update complaint status: Open → In Progress → Resolved
- Set priority levels: Low / Medium / High
- Image upload support for complaints
- Complete complaint history with timestamps

✅ **Overdue Detection**
- Automatic detection of unresolved complaints older than X days
- Separate view for overdue complaints
- Configurable threshold

✅ **Notice Board**
- Admins can create and manage notices
- Important notices marked and pinned to top
- Residents can view all notices

✅ **Admin Dashboard**
- Total complaints statistics
- Breakdown by status, category, and priority
- Recent complaints list
- Top residents by complaint count
- Overdue complaints tracking

✅ **File Upload**
- Image upload for complaints using Multer
- Local storage with static file serving
- Supported formats: JPG, PNG, GIF, WebP

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs
- **File Upload:** Multer
- **Email:** Nodemailer (optional)

### Frontend
- **HTML5**
- **CSS:** Tailwind CSS (CDN)
- **JavaScript:** Vanilla JS (no frameworks)
- **HTTP Client:** Fetch API

## Project Structure

```
prrr/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Complaint.js         # Complaint schema with history
│   │   └── Notice.js            # Notice schema
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── complaintController.js
│   │   ├── noticeController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── noticeRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── auth.js              # JWT & role verification
│   ├── config/
│   │   └── db.js                # Database connection
│   ├── uploads/                 # Image storage
│   ├── server.js                # Express app setup
│   ├── .env.example
│   └── seedData.js              # Sample data
├── frontend/
│   ├── index.html               # Login/Register page
│   ├── dashboard.html           # Resident dashboard
│   ├── admin.html               # Admin dashboard
│   ├── js/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   └── admin.js
│   └── css/
│       └── (Tailwind CDN)
├── package.json
├── README.md
└── API_DOCUMENTATION.md
```

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone or Extract the Project

```bash
cd prrr
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy the example .env file
cp backend/.env.example backend/.env

# Edit the .env file with your configuration
```

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

**Option B: MongoDB Atlas**
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 5. Seed Sample Data (Optional)

```bash
npm run seed
```

This will create:
- 2 admin accounts
- 3 resident accounts
- 5 sample complaints
- 3 sample notices

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
npm start
```

## Accessing the Application

1. **Login Page:** `http://localhost:5000/`
2. **Resident Dashboard:** `http://localhost:5000/dashboard`
3. **Admin Dashboard:** `http://localhost:5000/admin`

### Demo Accounts

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password123`

**Resident Accounts:**
- Email: `resident1@demo.com`, `resident2@demo.com`, `resident3@demo.com`
- Password: `password123` (all accounts)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Complaints
- `POST /api/complaints` - Create complaint (Protected, file upload)
- `GET /api/complaints` - Get complaints (Protected)
- `GET /api/complaints/:id` - Get single complaint (Protected)
- `PUT /api/complaints/:id` - Update complaint (Protected, Admin only)
- `DELETE /api/complaints/:id` - Delete complaint (Protected)

### Notices
- `POST /api/notices` - Create notice (Protected, Admin only)
- `GET /api/notices` - Get all notices (Protected)
- `GET /api/notices/:id` - Get single notice (Protected)
- `PUT /api/notices/:id` - Update notice (Protected, Admin only)
- `DELETE /api/notices/:id` - Delete notice (Protected, Admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard data (Protected, Admin only)
- `PUT /api/admin/check-overdue` - Check and mark overdue complaints (Protected, Admin only)

## Database Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (resident/admin),
  createdAt: Date
}
```

### Complaint
```javascript
{
  title: String (required),
  description: String (required),
  category: String (enum),
  status: String (Open, In Progress, Resolved),
  priority: String (Low, Medium, High),
  image: String (file path),
  isOverdue: Boolean,
  history: [
    {
      status: String,
      timestamp: Date,
      note: String,
      updatedBy: ObjectId (User)
    }
  ],
  createdBy: ObjectId (User),
  createdAt: Date,
  resolvedAt: Date
}
```

### Notice
```javascript
{
  title: String (required),
  message: String (required),
  important: Boolean,
  createdBy: ObjectId (User),
  createdAt: Date
}
### Complaint Workflow
1. **Create:** Resident creates complaint with title, description, category, and optional image
2. **Track:** Complaint appears in resident dashboard with current status
3. **Update:** Admin updates status (Open → In Progress → Resolved)
4. **History:** Each update is recorded with timestamp and admin name
5. **Overdue:** System automatically marks unresolved complaints as overdue after X days

### Admin Dashboard
- **Total Stats:** Quick overview of complaint counts
- **Status Breakdown:** Open, In Progress, Resolved counts
- **Recent Complaints:** Latest 10 complaints
- **Top Residents:** Residents with most complaints
- **Overdue List:** Complaints exceeding threshold

### Notice Board
- **Important Notices:** Pinned notices appear on top
- **All Residents:** Can view all notices
- **Admin Control:** Create, update, delete notices

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network access (if using Atlas)

### Port Already in Use
```bash
# Change PORT in .env to a different port (e.g., 3000)
```

### File Upload Not Working
- Ensure `/backend/uploads` directory exists
- Check file permissions
- Verify file size and format

### JWT Token Issues
- Clear browser localStorage and login again
- Check JWT_SECRET in .env
- Verify token format in Authorization header

## Security Considerations

✅ Implemented:
- Password hashing with bcryptjs (10 rounds)
- JWT-based stateless authentication
- Role-based access control
- Input validation
- CORS enabled
- File upload validation (type & size)

⚠️ To Enhance:
- Add rate limiting
- Implement HTTPS
- Add request validation middleware
- Add logging
- Implement email notifications
- Add audit logging

## Performance Optimization

- Database indexing on frequently queried fields
- Population of related documents using Mongoose
- Static file serving for images
- Efficient filtering and pagination ready

## Future Enhancements

- [ ] Email notifications for status updates
- [ ] SMS alerts for high-priority complaints
- [ ] Complaint comments/chat
- [ ] File attachments for complaints
- [ ] Analytics and reporting
- [ ] Mobile app
- [ ] Real-time notifications with WebSockets
- [ ] Payment integration for maintenance fees
- [ ] Resident approval workflow
- [ ] Document management

## License

ISC

## Support

For issues or questions:
1. Check the API_DOCUMENTATION.md
2. Review error messages in browser console
3. Check server logs in terminal

---

Built with ❤️ for Society Management
