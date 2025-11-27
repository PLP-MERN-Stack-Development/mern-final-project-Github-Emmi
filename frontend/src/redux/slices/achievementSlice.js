import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Mock achievement data
const mockAchievements = [
  // First Steps
  {
    id: 'first-course',
    title: 'First Steps',
    description: 'Enrolled in your first course',
    emoji: '🎓',
    category: 'First Steps',
    rarity: 'bronze',
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    progress: 100,
  },
  {
    id: 'first-assignment',
    title: 'Assignment Pioneer',
    description: 'Submitted your first assignment',
    emoji: '📝',
    category: 'First Steps',
    rarity: 'bronze',
    unlocked: true,
    unlockedAt: new Date('2024-01-20'),
    progress: 100,
  },
  {
    id: 'first-post',
    title: 'Community Contributor',
    description: 'Created your first community post',
    emoji: '💬',
    category: 'First Steps',
    rarity: 'bronze',
    unlocked: true,
    unlockedAt: new Date('2024-01-25'),
    progress: 100,
  },
  {
    id: 'profile-complete',
    title: 'Profile Perfect',
    description: 'Completed your profile 100%',
    emoji: '✨',
    category: 'First Steps',
    rarity: 'silver',
    unlocked: true,
    unlockedAt: new Date('2024-02-01'),
    progress: 100,
  },
  // Consistency
  {
    id: '7-day-streak',
    title: '7 Day Warrior',
    description: 'Maintained a 7-day learning streak',
    emoji: '🔥',
    category: 'Consistency',
    rarity: 'silver',
    unlocked: true,
    unlockedAt: new Date('2024-02-10'),
    progress: 100,
  },
  {
    id: '30-day-streak',
    title: 'Monthly Champion',
    description: 'Achieved a 30-day learning streak',
    emoji: '⚡',
    category: 'Consistency',
    rarity: 'gold',
    unlocked: false,
    progress: 73,
    target: 30,
    current: 22,
  },
  {
    id: '100-day-streak',
    title: 'Century Master',
    description: 'Incredible 100-day streak!',
    emoji: '💎',
    category: 'Consistency',
    rarity: 'platinum',
    unlocked: false,
    progress: 22,
    target: 100,
    current: 22,
  },
  {
    id: 'daily-learner',
    title: 'Daily Learner',
    description: 'Logged in every day for a week',
    emoji: '📅',
    category: 'Consistency',
    rarity: 'bronze',
    unlocked: true,
    unlockedAt: new Date('2024-02-08'),
    progress: 100,
  },
  // Progress Milestones
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Reached 50% completion in a course',
    emoji: '🚀',
    category: 'Progress',
    rarity: 'silver',
    unlocked: true,
    unlockedAt: new Date('2024-03-01'),
    progress: 100,
  },
  {
    id: 'course-graduate',
    title: 'Course Graduate',
    description: 'Completed your first course 100%',
    emoji: '🎖️',
    category: 'Progress',
    rarity: 'gold',
    unlocked: true,
    unlockedAt: new Date('2024-03-15'),
    progress: 100,
  },
  {
    id: 'overachiever',
    title: 'Overachiever',
    description: 'Completed 3 courses',
    emoji: '⭐',
    category: 'Progress',
    rarity: 'gold',
    unlocked: false,
    progress: 33,
    target: 3,
    current: 1,
  },
  {
    id: 'master-student',
    title: 'Master Student',
    description: 'Completed 10 courses',
    emoji: '👑',
    category: 'Progress',
    rarity: 'platinum',
    unlocked: false,
    progress: 10,
    target: 10,
    current: 1,
  },
  // Engagement
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Created 10 community posts',
    emoji: '🦋',
    category: 'Engagement',
    rarity: 'silver',
    unlocked: false,
    progress: 60,
    target: 10,
    current: 6,
  },
  {
    id: 'helpful-peer',
    title: 'Helpful Peer',
    description: 'Commented on 5 posts from others',
    emoji: '🤝',
    category: 'Engagement',
    rarity: 'bronze',
    unlocked: true,
    unlockedAt: new Date('2024-02-20'),
    progress: 100,
  },
  {
    id: 'popular-post',
    title: 'Popular Creator',
    description: 'Created a post with 10+ likes',
    emoji: '❤️',
    category: 'Engagement',
    rarity: 'silver',
    unlocked: false,
    progress: 70,
    target: 10,
    current: 7,
  },
  // Performance
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Scored 100% on an assignment',
    emoji: '💯',
    category: 'Performance',
    rarity: 'gold',
    unlocked: true,
    unlockedAt: new Date('2024-03-10'),
    progress: 100,
  },
  {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Maintained 90%+ average',
    emoji: '🏆',
    category: 'Performance',
    rarity: 'gold',
    unlocked: true,
    unlockedAt: new Date('2024-03-20'),
    progress: 100,
  },
  {
    id: 'top-student',
    title: 'Top Student',
    description: 'Ranked in top 10% of course',
    emoji: '🥇',
    category: 'Performance',
    rarity: 'platinum',
    unlocked: false,
    progress: 85,
  },
];

// Mock stats data
const mockStats = {
  totalAchievements: 50,
  unlockedAchievements: 12,
  currentStreak: 22,
  longestStreak: 22,
  totalStudyHours: 156,
  coursesCompleted: 1,
  totalCourses: 3,
  averageScore: 92,
  communityEngagement: 68,
  level: 8,
  xp: 3240,
  xpToNextLevel: 760,
  xpForNextLevel: 4000,
};

// Mock analytics data
const mockAnalytics = {
  learningProgress: [
    { date: '2024-03-01', hours: 4, assignments: 2 },
    { date: '2024-03-02', hours: 3, assignments: 1 },
    { date: '2024-03-03', hours: 5, assignments: 3 },
    { date: '2024-03-04', hours: 2, assignments: 1 },
    { date: '2024-03-05', hours: 6, assignments: 2 },
    { date: '2024-03-06', hours: 4, assignments: 2 },
    { date: '2024-03-07', hours: 5, assignments: 3 },
  ],
  courseDistribution: [
    { name: 'Completed', value: 1, color: '#10B981' },
    { name: 'In Progress', value: 2, color: '#F59E0B' },
    { name: 'Not Started', value: 0, color: '#6B7280' },
  ],
  assignmentScores: [
    { name: 'Assignment 1', score: 95 },
    { name: 'Assignment 2', score: 88 },
    { name: 'Assignment 3', score: 100 },
    { name: 'Assignment 4', score: 92 },
    { name: 'Assignment 5', score: 87 },
    { name: 'Assignment 6', score: 94 },
    { name: 'Assignment 7', score: 100 },
    { name: 'Assignment 8', score: 89 },
  ],
  weeklyActivity: Array.from({ length: 28 }, (_, i) => ({
    date: new Date(Date.now() - (27 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activity: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
  })),
};

// Mock activity timeline
const mockActivities = [
  {
    id: 1,
    type: 'achievement',
    title: 'Achievement Unlocked: High Achiever',
    description: 'Maintained 90%+ average',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: '🏆',
  },
  {
    id: 2,
    type: 'assignment',
    title: 'Assignment Submitted',
    description: 'Completed "React Hooks Assignment"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    icon: '📝',
  },
  {
    id: 3,
    type: 'course',
    title: 'Course Progress',
    description: 'Reached 75% in "Advanced React"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    icon: '📚',
  },
  {
    id: 4,
    type: 'post',
    title: 'Community Post',
    description: 'Shared your experience with hooks',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: '💬',
  },
  {
    id: 5,
    type: 'achievement',
    title: 'Achievement Unlocked: Perfectionist',
    description: 'Scored 100% on an assignment',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    icon: '💯',
  },
];

// Async thunks
export const fetchStudentAchievements = createAsyncThunk(
  'achievements/fetchStudentAchievements',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/achievements/student/${userId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchStudentStats = createAsyncThunk(
  'achievements/fetchStudentStats',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/achievements/stats/${userId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchLearningAnalytics = createAsyncThunk(
  'achievements/fetchLearningAnalytics',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/achievements/analytics/${userId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchActivityTimeline = createAsyncThunk(
  'achievements/fetchActivityTimeline',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/achievements/activity/${userId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

const achievementSlice = createSlice({
  name: 'achievements',
  initialState: {
    achievements: [],
    stats: null,
    analytics: null,
    activities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Achievements
      .addCase(fetchStudentAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchStudentAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchStudentStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStudentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Analytics
      .addCase(fetchLearningAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLearningAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchLearningAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Activities
      .addCase(fetchActivityTimeline.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActivityTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivityTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = achievementSlice.actions;
export default achievementSlice.reducer;
