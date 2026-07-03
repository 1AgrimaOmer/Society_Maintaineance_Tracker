# Quick Start Guide - Society Maintenance Tracker

## ✅ Project Successfully Created!

Your complete full-stack application is ready to run. Follow these steps to get started:

---

## 📋 Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas)
- **npm** (comes with Node.js)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Navigate to Project Directory
```bash
cd c:\Users\vaani\Desktop\prrr
```

### Step 2: Install Dependencies (Already Done ✓)
Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### Step 3: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Windows - Run in Command Prompt
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Update `backend/.env` with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/society-maintenance
```

### Step 4: Seed Sample Data (Optional)
```bash
npm run seed
```

This creates:
- 2 admin accounts
- 3 resident accounts  
- 5 sample complaints
- 3 sample notices

### Step 5: Start the Server
```bash
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### Step 6: Access the Application

Open your browser and go to:
- **Main App:** http://localhost:5000/
- **Or directly:**
  - **Resident Dashboard:** http://localhost:5000/dashboard
  - **Admin Dashboard:** http://localhost:5000/admin

---

## 🔐 Demo Accounts

### Admin Account
- **Email:** admin@demo.com
- **Password:** password123

### Resident Accounts
- **Email:** resident1@demo.com | Password: password123
- **Email:** resident2@demo.com | Password: password123
- **Email:** resident3@demo.com | Password: password123

---

## 📁 Project Structure

```
prrr/
├── backend/                      # Express.js backend
│   ├── models/                   # Database schemas
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Notice.js
│   ├── controllers/              # Business logic
│   ├── routes/                   # API endpoints
│   ├── middleware/               # Auth & authorization
│   ├── config/                   # Database connection
│   ├── uploads/                  # Image storage
│   ├── server.js                 # Express app
│   ├── seedData.js               # Sample data
│   ├── .env                      # Environment config
│   └── .env.example              # Example config
├── frontend/                     # Vanilla JS + Tailwind
│   ├── index.html                # Login page
│   ├── dashboard.html            # Resident dashboard
│   ├── admin.html                # Admin dashboard
│   ├── js/                       # JavaScript files
│   └── css/                      # Stylesheets
├── package.json                  # Dependencies
├── README.md                     # Full documentation
├── API_DOCUMENTATION.md          # API reference
└── SETUP_GUIDE.md               # This file
```

---

## 🎯 Key Features (All Implemented)

✅ **Authentication**
- Register/Login with JWT tokens
- Role-based access (Admin & Resident)

✅ **Complaint Management**
- File complaints with images
- Track status changes
- Complete history logging
- Priority assignment

✅ **Complaint Features**
- 8 categories: Plumbing, Electrical, Maintenance, Cleaning, Noise, Parking, Security, Other
- Status tracking: Open → In Progress → Resolved
- Priority levels: Low, Medium, High
- Automatic overdue detection

✅ **Notice Board**
- Create announcements
- Pin important notices
- Visible to all residents

✅ **Admin Dashboard**
- Real-time statistics
- Complaint filtering
- Overdue tracking
- Resident activity

✅ **File Upload**
- Multer image upload
- Local storage
- Static file serving

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Complaints
- `POST /api/complaints` (with file upload)
- `GET /api/complaints` (with filters)
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id` (Admin)
- `DELETE /api/complaints/:id`

### Notices
- `POST /api/notices` (Admin)
- `GET /api/notices`
- `PUT /api/notices/:id` (Admin)
- `DELETE /api/notices/:id` (Admin)

### Admin
- `GET /api/admin/dashboard`
- `PUT /api/admin/check-overdue`

See **API_DOCUMENTATION.md** for detailed endpoint documentation.

---

## 🛠️ Available Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed
```

---

## 🌐 Frontend Pages

### 1. Login/Register Page (`/`)
- Beautiful gradient UI with Tailwind CSS
- Toggle between login and register forms
- JWT token handling
- Role selection on registration

### 2. Resident Dashboard (`/dashboard`)
- Create new complaints
- View your complaints
- Track complaint status
- View all notices
- Upload complaint images

### 3. Admin Dashboard (`/admin`)
- Statistics dashboard
- Complaints table with filters
- Update complaint status
- Create and manage notices
- View overdue complaints
- Track resident activity

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/society-maintenance

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Features
OVERDUE_THRESHOLD=7
```

⚠️ **Security:** Change `JWT_SECRET` to a strong random string for production!

---

## 🚨 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service or check connection string in `.env`

### Port 5000 Already in Use
**Solution:** Change PORT in `.env` to a different number (e.g., 3000)

### File Upload Not Working
**Ensure:** 
- `/backend/uploads` directory exists (it does ✓)
- File is an image (JPG, PNG, GIF, WebP)
- File size is reasonable (< 5MB)

### CORS Errors
**Solution:** CORS is already enabled in the server

### Token Expires
**Solution:** Login again to get a new token

---

## 📊 Database Schema

### User
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "resident",
  createdAt: Date
}
```

### Complaint
```
{
  title: String,
  description: String,
  category: String,
  status: "Open" | "In Progress" | "Resolved",
  priority: "Low" | "Medium" | "High",
  image: String (file path),
  isOverdue: Boolean,
  history: [{
    status: String,
    timestamp: Date,
    note: String,
    updatedBy: ObjectId (User)
  }],
  createdBy: ObjectId (User),
  createdAt: Date,
  resolvedAt: Date
}
```

### Notice
```
{
  title: String,
  message: String,
  important: Boolean,
  createdBy: ObjectId (User),
  createdAt: Date
}
```

---

## 🔐 Security Features Implemented

✅ Password hashing with bcryptjs (10 rounds)  
✅ JWT-based stateless authentication  
✅ Role-based access control  
✅ Input validation  
✅ CORS protection  
✅ File upload validation  
✅ Error handling  

---

## 📈 Performance Optimizations

- Mongoose population for related documents
- Indexed database fields
- Static file serving
- Efficient filtering and sorting
- Responsive UI with Tailwind CSS

---

## 🎨 Frontend Stack

- **HTML5** with semantic markup
- **Tailwind CSS CDN** for styling (no build required!)
- **Vanilla JavaScript** (no frameworks)
- **Fetch API** for backend communication
- **Responsive design** for mobile & desktop

---

## 📚 Documentation Files

1. **README.md** - Complete project documentation
2. **API_DOCUMENTATION.md** - Detailed API reference with cURL examples
3. **SETUP_GUIDE.md** - This quick start guide

---

## ✨ What's Included

✅ Complete backend (Express + MongoDB)  
✅ Complete frontend (HTML + CSS + JS)  
✅ Authentication system  
✅ Complaint management  
✅ Complaint history tracking  
✅ Overdue detection  
✅ Notice board  
✅ Admin dashboard  
✅ Image upload  
✅ Role-based access control  
✅ Sample data seed script  
✅ Full documentation  
✅ API documentation  
✅ Error handling  
✅ CORS enabled  
✅ Production-ready code  

---

## 🚀 Production Deployment

### Before Going Live:

1. **Change JWT Secret**
   ```env
   JWT_SECRET=<generate-a-strong-random-string>
   ```

2. **Use MongoDB Atlas** (for reliability)
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db
   ```

3. **Set NODE_ENV**
   ```env
   NODE_ENV=production
   ```

4. **Add rate limiting** (consider adding in production)

5. **Enable HTTPS** (use reverse proxy like Nginx)

6. **Setup environment-specific .env files**

7. **Add logging** (consider Winston or Morgan)

8. **Backup database regularly**

---

## 💡 Next Steps

1. **Explore the admin dashboard** - Create test complaints
2. **Try filtering complaints** - By status, category, priority
3. **Upload images** - For complaints
4. **Test status updates** - Open → In Progress → Resolved
5. **Check complaint history** - See all changes
6. **Create notices** - Important announcements
7. **Review API** - See API_DOCUMENTATION.md

---

## 📞 Support & Issues

If you encounter any issues:

1. **Check the browser console** - Press F12
2. **Check terminal output** - Server logs
3. **Verify MongoDB** - Is it running?
4. **Check .env file** - Correct settings?
5. **Review API_DOCUMENTATION.md** - For endpoint details
6. **Check README.md** - For detailed info

---

## 📝 Notes

- All code is production-ready
- No unnecessary dependencies
- Clean, modular architecture
- Follows best practices
- Well-documented
- Easy to extend

---

## 🎉 You're All Set!

Your Society Maintenance Tracker is ready to use. Start the server and explore the application:

```bash
npm run dev
```

**Then open:** http://localhost:5000

Enjoy! 🚀

---

**Version:** 1.0.0  
**Created:** January 2024  
**Tech Stack:** Node.js, Express, MongoDB, Vanilla JS, Tailwind CSS
