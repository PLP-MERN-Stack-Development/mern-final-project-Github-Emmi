# Assignment System Implementation Plan

## Overview
Implement a complete assignment workflow where tutors can create assignments for their courses, students can submit work, and tutors can grade submissions with automated notifications.

## Database Models

### 1. Assignment Model
```javascript
{
  courseId: ObjectId (ref: Course),
  tutorId: ObjectId (ref: User),
  title: String (required),
  description: String,
  instructions: String,
  dueDate: Date,
  totalPoints: Number (default: 100),
  attachments: [{ fileName, fileUrl, fileType }],
  isPublished: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Submission Model
```javascript
{
  assignmentId: ObjectId (ref: Assignment),
  studentId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  submittedAt: Date,
  content: String,
  attachments: [{ fileName, fileUrl, fileType }],
  status: Enum ['submitted', 'graded', 'returned'],
  grade: Number,
  feedback: String,
  gradedBy: ObjectId (ref: User),
  gradedAt: Date
}
```

## API Endpoints

### Assignment Endpoints (Tutor)
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/course/:courseId` - Get all assignments for a course
- `GET /api/assignments/:id` - Get single assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `GET /api/assignments/tutor/pending-submissions` - Get pending submissions for tutor's courses

### Submission Endpoints
- `POST /api/assignments/:id/submit` - Student submits assignment
- `GET /api/assignments/:id/submissions` - Tutor views all submissions
- `GET /api/assignments/:id/submission` - Student views their submission
- `PUT /api/submissions/:id/grade` - Tutor grades submission

## Notification Triggers

### 1. Assignment Created
- **Trigger**: Tutor publishes new assignment
- **Recipients**: All students enrolled in the course
- **Type**: `assignment_created`
- **Message**: "New assignment '{title}' has been posted in {courseName}. Due: {dueDate}"

### 2. Assignment Submitted
- **Trigger**: Student submits assignment
- **Recipients**: Course tutor
- **Type**: `assignment_submitted`
- **Message**: "{studentName} submitted '{assignmentTitle}' in {courseName}"

### 3. Assignment Graded
- **Trigger**: Tutor grades submission
- **Recipients**: Student who submitted
- **Type**: `assignment_graded`
- **Message**: "Your assignment '{assignmentTitle}' has been graded. Score: {grade}/{totalPoints}"

## Frontend Components

### Tutor Views
1. **Assignment List** (`/tutor/courses/:courseId/assignments`)
   - List all assignments for the course
   - Create new assignment button
   - View submissions count
   - Filter by status

2. **Create/Edit Assignment** (`/tutor/assignments/create`, `/tutor/assignments/:id/edit`)
   - Form with title, description, instructions
   - File upload for attachments
   - Due date picker
   - Total points input
   - Publish/Save draft options

3. **Assignment Submissions** (`/tutor/assignments/:id/submissions`)
   - List all student submissions
   - Filter by status (pending, graded)
   - Quick grade interface
   - View student work

4. **Grade Submission** (`/tutor/submissions/:id/grade`)
   - View student submission
   - Download attachments
   - Grade input (0-100)
   - Feedback textarea
   - Submit grade button

### Student Views
1. **Course Assignments** (`/student/courses/:courseId/assignments`)
   - List all assignments for enrolled course
   - Status badges (not started, submitted, graded)
   - Due dates with countdown
   - View grades

2. **Assignment Details** (`/student/assignments/:id`)
   - Assignment instructions
   - Download attachments
   - Submit work interface
   - View submission status
   - View grade and feedback (if graded)

3. **Submit Assignment** (`/student/assignments/:id/submit`)
   - Text editor for written work
   - File upload for attachments
   - Submit button
   - Submission confirmation

## Implementation Steps

### Backend (Priority Order)
1. ✅ Create Assignment model
2. ✅ Create Submission model
3. ✅ Create assignment controller (CRUD operations)
4. ✅ Create submission controller
5. ✅ Add assignment routes
6. ✅ Implement notification triggers
7. ✅ Add authorization checks (tutors can only grade their course submissions)
8. ✅ Add file upload handling

### Frontend (Priority Order)
1. ⬜ Create Assignment list page for tutors
2. ⬜ Create Assignment form (create/edit)
3. ⬜ Create Submissions view for tutors
4. ⬜ Create Grading interface
5. ⬜ Create Student assignment list
6. ⬜ Create Student submission interface
7. ⬜ Add real-time notifications
8. ⬜ Add file upload/download UI

## Security Considerations
- Tutors can only create assignments for their own courses
- Tutors can only view/grade submissions for their courses
- Students can only submit to courses they're enrolled in
- Students can only view their own submissions
- File upload size limits and type restrictions
- Prevent submission after due date (configurable)

## Future Enhancements
- Rubric-based grading
- Peer review system
- Late submission penalties
- Plagiarism detection
- Auto-grading for multiple choice
- Bulk grading tools
- Analytics dashboard for assignment performance
