# EmmiDev-CodeBridge API Routes

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Routes

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student", // student | tutor
  "bio": "Aspiring developer"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user }
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 📚 Course Routes

### Get All Courses (Public)
```http
GET /api/courses?page=1&limit=10&category=programming&level=beginner&search=react
```

### Get Single Course
```http
GET /api/courses/:courseId
```

### Create Course (Tutor Only)
```http
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete React.js Course",
  "description": "Learn React from scratch",
  "price": 25000,
  "currency": "NGN",
  "category": "programming",
  "level": "beginner",
  "syllabus": [
    {
      "title": "Introduction to React",
      "description": "Getting started",
      "resources": ["https://react.dev"]
    }
  ]
}
```

### Update Course (Tutor/Admin)
```http
PUT /api/courses/:courseId
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 30000
}
```

### Delete Course (Tutor/Admin)
```http
DELETE /api/courses/:courseId
Authorization: Bearer {token}
```

### Enroll in Course (Student)
```http
POST /api/courses/:courseId/enroll
Authorization: Bearer {token}
```

### Get Course Schedule
```http
GET /api/courses/:courseId/schedule
Authorization: Bearer {token}
```

### Rate Course
```http
POST /api/courses/:courseId/rate
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent course!"
}
```

---

## 📝 Assignment Routes

### Get Course Assignments
```http
GET /api/assignments/course/:courseId
Authorization: Bearer {token}
```

### Create Assignment (Tutor)
```http
POST /api/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course_id",
  "title": "React Component Assignment",
  "description": "Create a functional component",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "maxScore": 100,
  "allowLateSubmission": true,
  "lateSubmissionPenalty": 10
}
```

### Get Assignment Details
```http
GET /api/assignments/:assignmentId
Authorization: Bearer {token}
```

### Submit Assignment (Student)
```http
POST /api/assignments/:assignmentId/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "text": "My submission text",
  "files": [file1, file2]
}
```

### Get Assignment Submissions (Tutor)
```http
GET /api/assignments/:assignmentId/submissions
Authorization: Bearer {token}
```

### Grade Submission (Tutor)
```http
PUT /api/assignments/submissions/:submissionId/grade
Authorization: Bearer {token}
Content-Type: application/json

{
  "score": 85,
  "feedback": "Great work!"
}
```

### Get My Submissions (Student)
```http
GET /api/assignments/my-submissions
Authorization: Bearer {token}
```

---

## 🌐 Community Feed Routes

### Get All Posts
```http
GET /api/feeds?page=1&limit=10
Authorization: Bearer {token}
```

### Get Single Post
```http
GET /api/feeds/:postId
Authorization: Bearer {token}
```

### Create Post
```http
POST /api/feeds
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "contentText": "Just completed my first React project! #javascript",
  "media": [file1, file2]
}
```

### Update Post
```http
PUT /api/feeds/:postId
Authorization: Bearer {token}
Content-Type: application/json

{
  "contentText": "Updated content"
}
```

### Delete Post
```http
DELETE /api/feeds/:postId
Authorization: Bearer {token}
```

### Like/Unlike Post
```http
POST /api/feeds/:postId/like
Authorization: Bearer {token}
```

### Add Comment
```http
POST /api/feeds/:postId/comment
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Great post!"
}
```

### Delete Comment
```http
DELETE /api/feeds/:postId/comment/:commentId
Authorization: Bearer {token}
```

---

## 🎥 Zoom Integration Routes

### Create Zoom Meeting (Tutor)
```http
POST /api/zoom/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course_id",
  "topic": "React Hooks Deep Dive",
  "startTime": "2025-12-20T10:00:00Z",
  "duration": 60,
  "agenda": "Learn useState, useEffect"
}
```

### Get Meeting Details
```http
GET /api/zoom/meetings/:meetingId
Authorization: Bearer {token}
```

### Update Meeting
```http
PUT /api/zoom/meetings/:meetingId
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "Updated Topic",
  "startTime": "2025-12-20T11:00:00Z"
}
```

### Delete Meeting
```http
DELETE /api/zoom/meetings/:meetingId
Authorization: Bearer {token}
```

---

## 🔔 Notification Routes

### Get All Notifications
```http
GET /api/notifications?unreadOnly=false
Authorization: Bearer {token}
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

### Mark as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer {token}
```

### Delete Notification
```http
DELETE /api/notifications/:notificationId
Authorization: Bearer {token}
```

---

## 💬 Chat Routes

### Get Chat Rooms
```http
GET /api/chat/rooms
Authorization: Bearer {token}
```

### Get Room Messages
```http
GET /api/chat/rooms/:roomId/messages?page=1&limit=50
Authorization: Bearer {token}
```

### Create Direct Room
```http
POST /api/chat/rooms/direct
Authorization: Bearer {token}
Content-Type: application/json

{
  "participantId": "user_id"
}
```

### Delete Message
```http
DELETE /api/chat/messages/:messageId
Authorization: Bearer {token}
```

---

## 💳 Payment Routes

### Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course_id",
  "email": "student@email.com"
}

Response: { authorization_url, reference }
```

### Verify Payment
```http
GET /api/payments/verify/:reference
Authorization: Bearer {token}
```

### Get Payment History
```http
GET /api/payments/history
Authorization: Bearer {token}
```

### Paystack Webhook
```http
POST /api/payments/webhook
Content-Type: application/json
x-paystack-signature: {signature}

{
  "event": "charge.success",
  "data": { ... }
}
```

---

## 🤖 AI Recommendation Routes

### Get Study Recommendations
```http
POST /api/ai/recommendations
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course_id",
  "studentProgress": {
    "completedLessons": 5,
    "totalLessons": 10,
    "averageScore": 75
  }
}
```

### Get Resource Recommendations
```http
POST /api/ai/resources
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "React Hooks",
  "level": "intermediate"
}
```

### Analyze Performance
```http
POST /api/ai/analyze-performance
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course_id",
  "studentId": "student_id"
}
```

### Generate Study Plan
```http
POST /api/ai/study-plan
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": "course_id",
  "weeksAvailable": 4,
  "hoursPerWeek": 10
}
```

### Ask AI Question
```http
POST /api/ai/ask
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "What is the difference between useState and useReducer?",
  "context": "React Hooks course"
}
```

### Pre-grade Assignment (Tutor)
```http
POST /api/ai/pre-grade
Authorization: Bearer {token}
Content-Type: application/json

{
  "submissionId": "submission_id",
  "rubric": "Code quality, functionality, documentation"
}
```

---

## 🏥 Health & Misc Routes

### API Health Check
```http
GET http://localhost:5000/health
```

### API Root
```http
GET http://localhost:5000/
```

---

## 🔒 Authentication Notes

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

The token is returned on successful login/registration.

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

---

## 🎯 Testing Workflow

1. **Register a user** → Get token
2. **Login** → Get token (saved automatically in Postman)
3. **Create course** (as tutor)
4. **Enroll in course** (as student)
5. **Create assignment** (as tutor)
6. **Submit assignment** (as student)
7. **Grade submission** (as tutor)
8. **Create post** (community feed)
9. **Like/comment** on posts
10. **Initialize payment** → Get authorization URL
11. **Verify payment** → Complete enrollment

---

## 📦 Postman Collection

Import the `EmmiDev-CodeBridge-API.postman_collection.json` file into Postman for a complete pre-configured collection with all endpoints.

### Variables Set in Collection:
- `baseUrl`: http://localhost:5000/api
- `token`: Auto-populated after login

---

**Happy Testing! 🚀**
