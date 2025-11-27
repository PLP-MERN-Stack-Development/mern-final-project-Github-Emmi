# Student Achievements & Progress Analytics System

A comprehensive gamification system for tracking student progress, unlocking achievements, and providing analytics.

## 📋 Overview

The achievements system includes:
- **18 Achievements** across 5 categories (First Steps, Consistency, Progress, Engagement, Performance)
- **Rarity System**: Bronze, Silver, Gold, Platinum, Diamond
- **XP & Leveling**: Students earn XP and level up
- **Streak Tracking**: Daily learning streaks
- **Analytics Dashboard**: Interactive charts and insights
- **Activity Timeline**: Real-time activity feed
- **AI-Powered Insights**: Personalized recommendations

## 🗄️ Database Models

### Achievement
Stores individual achievement unlocks for users.

```javascript
{
  userId: ObjectId,
  achievementId: String, // e.g., 'first-course'
  title: String,
  description: String,
  emoji: String,
  category: String,
  rarity: String,
  unlocked: Boolean,
  unlockedAt: Date,
  progress: Number, // 0-100
  target: Number,
  current: Number
}
```

### StudentStats
Aggregated statistics for each student.

```javascript
{
  userId: ObjectId,
  level: Number,
  xp: Number,
  currentStreak: Number,
  longestStreak: Number,
  totalStudyHours: Number,
  coursesCompleted: Number,
  totalCourses: Number,
  averageScore: Number,
  communityEngagement: Number,
  totalPosts: Number,
  totalComments: Number
}
```

### StudentActivity
Activity timeline/feed for students.

```javascript
{
  userId: ObjectId,
  activityType: String, // 'course_enrolled', 'assignment_submitted', etc.
  title: String,
  description: String,
  icon: String,
  metadata: {
    courseId: ObjectId,
    assignmentId: ObjectId,
    score: Number,
    xpGained: Number
  }
}
```

## 🎯 Achievement Definitions

All achievements are defined in `/backend/utils/achievementDefinitions.js`:

### First Steps
- **First Steps** (Bronze): Enrolled in first course - 50 XP
- **Getting Started** (Bronze): Submitted first assignment - 50 XP
- **Voice Heard** (Bronze): Created first post - 30 XP
- **All Set Up** (Bronze): Completed profile - 40 XP

### Consistency
- **Week Warrior** (Silver): 7-day streak - 100 XP
- **Monthly Champion** (Gold): 30-day streak - 500 XP
- **Unstoppable** (Diamond): 100-day streak - 2000 XP
- **Early Bird** (Silver): Login before 7 AM (10 times) - 150 XP

### Progress
- **Course Conqueror** (Silver): Completed first course - 200 XP
- **Learning Enthusiast** (Gold): Completed 3 courses - 400 XP
- **Knowledge Seeker** (Platinum): Completed 10 courses - 1000 XP
- **Century Scholar** (Gold): 100 hours study time - 600 XP

### Engagement
- **Community Contributor** (Silver): 10 posts - 150 XP
- **Social Butterfly** (Gold): 50 posts - 500 XP
- **Discussion Master** (Gold): 100 comments - 400 XP

### Performance
- **Perfectionist** (Silver): Perfect score on assignment - 150 XP
- **High Achiever** (Gold): 90%+ average (5 assignments) - 400 XP
- **Overachiever** (Platinum): 95%+ on 10 assignments - 800 XP

## 🔌 API Endpoints

### GET /api/achievements/student/:userId
Get all achievements for a student (unlocked and locked).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "first-course",
      "title": "First Steps",
      "description": "Enrolled in your first course",
      "emoji": "🎓",
      "category": "First Steps",
      "rarity": "bronze",
      "unlocked": true,
      "unlockedAt": "2024-03-15T10:30:00Z",
      "progress": 100,
      "target": 1,
      "current": 1
    },
    // ... more achievements
  ]
}
```

### GET /api/achievements/stats/:userId
Get student statistics and progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAchievements": 18,
    "unlockedAchievements": 5,
    "level": 3,
    "xp": 450,
    "xpForNextLevel": 1500,
    "xpToNextLevel": 1050,
    "currentStreak": 7,
    "longestStreak": 15,
    "totalStudyHours": 24,
    "coursesCompleted": 1,
    "totalCourses": 3,
    "averageScore": 88,
    "communityEngagement": 45
  }
}
```

### GET /api/achievements/analytics/:userId
Get learning analytics for charts.

**Response:**
```json
{
  "success": true,
  "data": {
    "learningProgress": [
      { "date": "Mar 10", "hours": 3, "assignments": 1 },
      // ... last 7 days
    ],
    "courseDistribution": [
      { "name": "Completed", "value": 1, "color": "#10b981" },
      { "name": "In Progress", "value": 2, "color": "#f59e0b" }
    ],
    "assignmentScores": [
      { "name": "Assignment 1", "score": 95 },
      // ... last 8 assignments
    ],
    "weeklyActivity": [
      { "date": "2024-03-01", "count": 3 },
      // ... last 28 days
    ]
  }
}
```

### GET /api/achievements/activity/:userId
Get recent activity timeline.

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Achievement Unlocked: First Steps",
      "description": "Enrolled in your first course",
      "icon": "🎓",
      "timestamp": "2024-03-15T10:30:00Z",
      "metadata": {
        "achievementId": "first-course",
        "xpGained": 50
      }
    },
    // ... more activities
  ]
}
```

### POST /api/achievements/check/:userId
Internal endpoint to check and unlock achievements (called by other controllers).

**Request Body:**
```json
{
  "triggerType": "assignment_submitted",
  "metadata": {
    "assignmentId": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unlockedCount": 2,
    "achievements": [/* newly unlocked achievements */]
  }
}
```

## 🔄 Achievement Triggers

Achievements are automatically checked when:

### Course Enrollment
- Triggers: `first-course` achievement
- Controller: `courseController.enrollInCourse`
- Updates: `totalCourses` in StudentStats

### Course Completion
- Triggers: `first-completion`, `3-courses`, `10-courses` achievements
- Updates: `coursesCompleted` in StudentStats

### Assignment Submission
- Triggers: `first-assignment` achievement
- Controller: `assignmentController.submitAssignment`
- Creates: Activity timeline entry

### Assignment Graded
- Triggers: `perfect-score`, `high-achiever`, `overachiever` achievements
- Controller: `assignmentController.gradeSubmission`
- Updates: `averageScore`, `completedAssignments` in StudentStats

### Post Created
- Triggers: `first-post`, `10-posts`, `50-posts` achievements
- Controller: `feedController.createPost`
- Updates: `totalPosts` in StudentStats

### Comment Created
- Triggers: `100-comments` achievement
- Updates: `totalComments` in StudentStats

### Daily Streak
- Triggers: `7-day-streak`, `30-day-streak`, `100-day-streak` achievements
- Auto-updated when StudentStats is accessed

## 🎨 Frontend Components

### AchievementsPage.jsx
Main dashboard displaying:
- Hero section with level/XP
- 4 stat cards (animated)
- Achievement grid with category filters
- 3 interactive charts (Recharts)
- AI insights section
- Activity timeline

### Key Features:
- **Animations**: Framer Motion for smooth transitions
- **Count-up numbers**: Spring animations for stats
- **Progress bars**: Visual progress indicators
- **Locked state**: Grayed out with lock icon
- **Rarity colors**: Gradient backgrounds per rarity
- **Responsive**: Mobile-first design

## 🚀 Usage Example

### Check achievements when student submits assignment:

```javascript
// In assignmentController.js
const { checkAndUnlockAchievements } = require('./achievementController');

// After saving submission
await checkAndUnlockAchievements(req.user.id, 'assignment_submitted', {
  assignmentId: assignment._id
});
```

### Frontend - Display achievements:

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAchievements } from './redux/slices/achievementSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { achievements, loading } = useSelector(state => state.achievements);
  
  useEffect(() => {
    dispatch(fetchStudentAchievements(userId));
  }, []);
  
  return (
    <div>
      {achievements.map(achievement => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}
```

## 📊 XP & Leveling System

### XP Formula:
- Level 1 → 2: 1000 XP
- Level 2 → 3: 1500 XP
- Level 3 → 4: 2250 XP
- Formula: `1000 * (1.5 ^ (level - 1))`

### XP Sources:
- Achievements (30-2000 XP)
- Course completion (auto-calculated)
- Perfect scores (bonus XP)

### Level Benefits:
- Unlock special badges
- Leaderboard ranking
- Profile showcase

## 🔒 Authorization

All endpoints require authentication (`protect` middleware).

Users can only access their own data unless they are admin/superadmin:
```javascript
if (req.user.id !== userId && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Not authorized' });
}
```

## 🧪 Testing

### Test achievement unlocking:
```bash
# Enroll in a course
POST /api/courses/:id/enroll

# Check achievements unlocked
GET /api/achievements/student/:userId
# Should show 'first-course' unlocked
```

### Test streak tracking:
```bash
# Update streak (happens automatically on activity)
# Check stats
GET /api/achievements/stats/:userId
# currentStreak should increment on consecutive days
```

## 📝 Future Enhancements

- [ ] Leaderboards (global, course-specific)
- [ ] Achievement badges on profile
- [ ] Share achievements on social media
- [ ] Custom achievement images
- [ ] Seasonal/limited-time achievements
- [ ] Team/group achievements
- [ ] Achievement notifications (push/email)
- [ ] Retroactive achievement unlocking (for existing users)
- [ ] Achievement categories expansion
- [ ] Study hour tracking (automatic via session time)

## 🐛 Debugging

### Check if achievement unlocked:
```javascript
const achievement = await Achievement.findOne({ 
  userId, 
  achievementId: 'first-course' 
});
console.log('Unlocked:', achievement?.unlocked);
```

### Check student stats:
```javascript
const stats = await StudentStats.findOne({ userId });
console.log('Level:', stats.level);
console.log('XP:', stats.xp);
console.log('Streak:', stats.currentStreak);
```

### View activity log:
```javascript
const activities = await StudentActivity.find({ userId })
  .sort({ createdAt: -1 })
  .limit(10);
console.log('Recent activities:', activities);
```

## 📚 Related Files

**Backend:**
- `/models/Achievement.js` - Achievement model
- `/models/StudentStats.js` - Stats model
- `/models/StudentActivity.js` - Activity model
- `/controllers/achievementController.js` - Main controller
- `/routes/achievementRoutes.js` - API routes
- `/utils/achievementDefinitions.js` - Achievement definitions

**Frontend:**
- `/redux/slices/achievementSlice.js` - Redux state
- `/pages/student/AchievementsPage.jsx` - Main dashboard
- `/App.jsx` - Route configuration
- `/layouts/DashboardLayout.jsx` - Navigation

## 🎉 Conclusion

The achievements system is fully integrated and ready for production. Students will see their progress tracked automatically as they:
- Enroll in courses
- Submit assignments
- Get graded
- Post in community
- Maintain learning streaks

All achievements unlock automatically based on defined criteria, with real-time updates via the activity timeline and stats dashboard.
