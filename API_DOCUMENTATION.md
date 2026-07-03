# API Documentation - Society Maintenance Tracker

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format
All responses are in JSON format:

### Success Response (200-201)
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Error Response (400-500)
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "resident" // optional, defaults to "resident"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident"
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Missing fields or user already exists
- `500` - Server error

---

### 2. Login User
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Get Current User
**GET** `/auth/me`

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authorized
- `500` - Server error

---

## Complaint Endpoints

### 1. Create Complaint
**POST** `/complaints`

**Access:** Private (All authenticated users)

**Content-Type:** `multipart/form-data`

**Request:**
```
POST /api/complaints
Authorization: Bearer <token>

Form Data:
- title: "Leaking Tap" (required)
- description: "Tap in bathroom is leaking" (required)
- category: "Plumbing" (required)
- image: <file> (optional)
```

**Categories:**
- Plumbing
- Electrical
- Maintenance
- Cleaning
- Noise
- Parking
- Security
- Other

**Response (201):**
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Leaking Tap",
    "description": "Tap in bathroom is leaking",
    "category": "Plumbing",
    "status": "Open",
    "priority": "Low",
    "image": "/uploads/1234567890.jpg",
    "isOverdue": false,
    "history": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "status": "Open",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "note": "Complaint created",
        "updatedBy": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "role": "resident"
        }
      }
    ],
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "resident"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "resolvedAt": null
  }
}
```

**Status Codes:**
- `201` - Complaint created
- `400` - Missing required fields or invalid file
- `401` - Not authorized
- `500` - Server error

---

### 2. Get Complaints
**GET** `/complaints`

**Access:** Private

**Query Parameters (Optional):**
- `status` - Filter by status (Open, In Progress, Resolved)
- `category` - Filter by category
- `priority` - Filter by priority (Low, Medium, High)
- `overdue` - Filter overdue complaints (true/false)

**Examples:**
```
GET /api/complaints
GET /api/complaints?status=Open
GET /api/complaints?category=Plumbing&priority=High
GET /api/complaints?overdue=true
```

**Response (200):**
```json
{
  "success": true,
  "complaints": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Leaking Tap",
      "description": "Tap in bathroom is leaking",
      "category": "Plumbing",
      "status": "Open",
      "priority": "Low",
      "image": "/uploads/1234567890.jpg",
      "isOverdue": false,
      "createdBy": { ... },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Notes:**
- Residents see only their complaints
- Admins see all complaints

---

### 3. Get Single Complaint
**GET** `/complaints/:id`

**Access:** Private

**URL Parameters:**
- `id` - Complaint ID

**Response (200):**
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Leaking Tap",
    "description": "Tap in bathroom is leaking",
    "category": "Plumbing",
    "status": "Open",
    "priority": "Low",
    "image": "/uploads/1234567890.jpg",
    "isOverdue": false,
    "history": [...],
    "createdBy": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "resolvedAt": null
  }
}
```

**Status Codes:**
- `200` - Success
- `403` - Not authorized to view this complaint
- `404` - Complaint not found
- `401` - Not authenticated

---

### 4. Update Complaint
**PUT** `/complaints/:id`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "High",
  "note": "Started working on this",
  "isOverdue": false
}
```

**Response (200):**
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Leaking Tap",
    "description": "Tap in bathroom is leaking",
    "category": "Plumbing",
    "status": "In Progress",
    "priority": "High",
    "image": "/uploads/1234567890.jpg",
    "isOverdue": false,
    "history": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "status": "Open",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "note": "Complaint created",
        "updatedBy": { ... }
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "status": "In Progress",
        "timestamp": "2024-01-15T11:00:00.000Z",
        "note": "Started working on this",
        "updatedBy": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Admin User",
          "role": "admin"
        }
      }
    ],
    "createdBy": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Bad request
- `403` - Not authorized (not admin)
- `404` - Complaint not found
- `401` - Not authenticated

---

### 5. Delete Complaint
**DELETE** `/complaints/:id`

**Access:** Private (Owner or Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Complaint deleted"
}
```

**Status Codes:**
- `200` - Deleted successfully
- `403` - Not authorized
- `404` - Complaint not found
- `401` - Not authenticated

---

## Notice Endpoints

### 1. Create Notice
**POST** `/notices`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "title": "Water Maintenance",
  "message": "Water maintenance will be done on 20th Jan from 9 AM to 12 PM",
  "important": true
}
```

**Response (201):**
```json
{
  "success": true,
  "notice": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Water Maintenance",
    "message": "Water maintenance will be done on 20th Jan from 9 AM to 12 PM",
    "important": true,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Admin User",
      "role": "admin"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Notice created
- `400` - Missing required fields
- `403` - Not authorized (not admin)
- `401` - Not authenticated

---

### 2. Get Notices
**GET** `/notices`

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "notices": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Water Maintenance",
      "message": "Water maintenance will be done...",
      "important": true,
      "createdBy": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Admin User",
        "role": "admin"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Notes:**
- Notices are sorted by importance first, then by creation date
- Important notices appear at the top

---

### 3. Get Single Notice
**GET** `/notices/:id`

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "notice": { ... }
}
```

---

### 4. Update Notice
**PUT** `/notices/:id`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "title": "Updated Title",
  "message": "Updated message",
  "important": false
}
```

**Response (200):**
```json
{
  "success": true,
  "notice": { ... }
}
```

---

### 5. Delete Notice
**DELETE** `/notices/:id`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Notice deleted"
}
```

---

## Admin Dashboard Endpoints

### 1. Get Dashboard Data
**GET** `/admin/dashboard`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "totalComplaints": 25,
    "overdueComplaints": 3,
    "statusCounts": {
      "open": 5,
      "inProgress": 8,
      "resolved": 12
    },
    "categoryCounts": [
      { "_id": "Plumbing", "count": 8 },
      { "_id": "Electrical", "count": 5 },
      { "_id": "Maintenance", "count": 7 },
      { "_id": "Other", "count": 5 }
    ],
    "priorityCounts": [
      { "_id": "Low", "count": 10 },
      { "_id": "Medium", "count": 8 },
      { "_id": "High", "count": 7 }
    ],
    "recentComplaints": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Leaking Tap",
        "status": "Open",
        "priority": "Low",
        "category": "Plumbing",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "overduelist": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Broken Window",
        "category": "Maintenance",
        "createdAt": "2024-01-01T10:30:00.000Z",
        "createdBy": {
          "_id": "507f1f77bcf86cd799439015",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "resident"
        }
      }
    ],
    "complaintsByResident": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "userName": "John Doe",
        "count": 5
      },
      {
        "_id": "507f1f77bcf86cd799439016",
        "userName": "Jane Smith",
        "count": 3
      }
    ]
  }
}
```

---

### 2. Check and Mark Overdue Complaints
**PUT** `/admin/check-overdue`

**Access:** Private (Admin only)

**Request Body (Optional):**
```json
{
  "overdueThresholdDays": 7
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Updated 3 complaints to overdue",
  "updated": 3
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'resident' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Complaint not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding it for production use.

---

## Pagination

Currently, no pagination is implemented. All results are returned. Consider implementing pagination for large datasets.

---

## Sorting

- Complaints: Sorted by `createdAt` in descending order
- Notices: Sorted by `important` (descending), then `createdAt` (descending)

---

## Example cURL Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "resident"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Complaint with Image
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer <token>" \
  -F "title=Leaking Tap" \
  -F "description=Tap in bathroom is leaking" \
  -F "category=Plumbing" \
  -F "image=@/path/to/image.jpg"
```

### Get Complaints with Filters
```bash
curl -X GET "http://localhost:5000/api/complaints?status=Open&category=Plumbing" \
  -H "Authorization: Bearer <token>"
```

### Update Complaint
```bash
curl -X PUT http://localhost:5000/api/complaints/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "In Progress",
    "priority": "High",
    "note": "Started working on this"
  }'
```

---

## Version
**v1.0.0**

Last Updated: January 2024
