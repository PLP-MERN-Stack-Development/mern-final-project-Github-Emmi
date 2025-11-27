const Achievement = require('../models/Achievement');
const StudentStats = require('../models/StudentStats');
const StudentActivity = require('../models/StudentActivity');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Post = require('../models/Post');
const { getAllAchievementDefinitions, getAchievementDefinition } = require('../utils/achievementDefinitions');

// @desc    Get student achievements
// @route   GET /api/achievements/student/:userId
// @access  Private
exports.getStudentAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    // Get all achievement definitions
    const allDefinitions = getAllAchievementDefinitions();

    // Get user's unlocked achievements
    const unlockedAchievements = await Achievement.find({ userId }).lean();

    // Create a map of unlocked achievements
    const unlockedMap = {};
    unlockedAchievements.forEach(achievement => {
      unlockedMap[achievement.achievementId] = achievement;
    });

    // Merge definitions with user's progress
    const achievements = allDefinitions.map(def => {
      const userAchievement = unlockedMap[def.id];
      
      if (userAchievement) {
        return {
          id: def.id,
          title: def.title,
          description: def.description,
          emoji: def.emoji,
          category: def.category,
          rarity: def.rarity,
          unlocked: userAchievement.unlocked,
          unlockedAt: userAchievement.unlockedAt,
          progress: userAchievement.progress,
          target: def.target,
          current: userAchievement.current
        };
      } else {
        return {
          id: def.id,
          title: def.title,
          description: def.description,
          emoji: def.emoji,
          category: def.category,
          rarity: def.rarity,
          unlocked: false,
          progress: 0,
          target: def.target,
          current: 0
        };
      }
    });

    res.status(200).json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Get student achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};

// @desc    Get student stats
// @route   GET /api/achievements/stats/:userId
// @access  Private
exports.getStudentStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    // Get or create student stats
    let stats = await StudentStats.findOne({ userId });
    
    if (!stats) {
      // Create new stats for user
      stats = await StudentStats.create({ userId });
    }

    // Get total achievements count
    const totalAchievements = getAllAchievementDefinitions().length;
    const unlockedCount = await Achievement.countDocuments({ userId, unlocked: true });

    // Calculate XP progress
    const xpForNextLevel = stats.getXpForNextLevel();
    const xpToNextLevel = stats.getXpToNextLevel();

    res.status(200).json({
      success: true,
      data: {
        totalAchievements,
        unlockedAchievements: unlockedCount,
        level: stats.level,
        xp: stats.xp,
        xpForNextLevel,
        xpToNextLevel,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalStudyHours: stats.totalStudyHours,
        coursesCompleted: stats.coursesCompleted,
        totalCourses: stats.totalCourses,
        averageScore: stats.averageScore,
        communityEngagement: stats.communityEngagement
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student stats',
      error: error.message
    });
  }
};

// @desc    Get learning analytics
// @route   GET /api/achievements/analytics/:userId
// @access  Private
exports.getLearningAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    // Get last 7 days of activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await StudentActivity.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).lean();

    // Generate learning progress data (last 7 days)
    const learningProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate.toDateString() === date.toDateString();
      });

      const assignmentCount = dayActivities.filter(a => a.activityType === 'assignment_submitted').length;
      
      learningProgress.push({
        date: dateStr,
        hours: Math.floor(Math.random() * 4) + 1, // TODO: Calculate actual study hours
        assignments: assignmentCount
      });
    }

    // Get course distribution
    const enrolledCourses = await Course.find({
      _id: { $in: req.user.enrolledCourses || [] }
    }).lean();

    const stats = await StudentStats.findOne({ userId });
    const completedCount = stats?.coursesCompleted || 0;
    const inProgressCount = enrolledCourses.length - completedCount;
    
    const courseDistribution = [
      { name: 'Completed', value: completedCount, color: '#10b981' },
      { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
      { name: 'Not Started', value: 0, color: '#6b7280' }
    ];

    // Get assignment scores (last 8 assignments)
    const submissions = await Submission.find({ studentId: userId })
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const assignmentScores = submissions
      .filter(sub => sub.grade !== undefined && sub.grade !== null)
      .map(sub => ({
        name: sub.assignmentId?.title?.substring(0, 15) || 'Assignment',
        score: sub.grade
      }))
      .reverse();

    // Generate weekly activity heatmap (last 28 days)
    const weeklyActivity = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate.toDateString() === date.toDateString();
      });

      weeklyActivity.push({
        date: date.toISOString().split('T')[0],
        count: dayActivities.length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        learningProgress,
        courseDistribution,
        assignmentScores,
        weeklyActivity
      }
    });
  } catch (error) {
    console.error('Get learning analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching learning analytics',
      error: error.message
    });
  }
};

// @desc    Get activity timeline
// @route   GET /api/achievements/activity/:userId
// @access  Private
exports.getActivityTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    const activities = await StudentActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      title: activity.title,
      description: activity.description,
      icon: activity.icon,
      timestamp: activity.createdAt,
      metadata: activity.metadata
    }));

    res.status(200).json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity timeline',
      error: error.message
    });
  }
};

// @desc    Check and unlock achievements (internal use)
// @route   POST /api/achievements/check/:userId
// @access  Private
exports.checkAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const { triggerType, metadata } = req.body;

    const newlyUnlocked = await checkAndUnlockAchievements(userId, triggerType, metadata);

    res.status(200).json({
      success: true,
      data: {
        unlockedCount: newlyUnlocked.length,
        achievements: newlyUnlocked
      }
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking achievements',
      error: error.message
    });
  }
};

// Helper function to check and unlock achievements
async function checkAndUnlockAchievements(userId, triggerType, metadata = {}) {
  const newlyUnlocked = [];

  try {
    // Get student stats
    let stats = await StudentStats.findOne({ userId });
    if (!stats) {
      stats = await StudentStats.create({ userId });
    }

    // Update streak
    stats.updateStreak();
    await stats.save();

    // Check different achievement types based on trigger
    switch (triggerType) {
      case 'course_enrolled':
        await checkCourseAchievements(userId, stats, newlyUnlocked);
        break;
      
      case 'course_completed':
        stats.coursesCompleted += 1;
        await stats.save();
        await checkCourseAchievements(userId, stats, newlyUnlocked);
        break;
      
      case 'assignment_submitted':
        await checkAssignmentAchievements(userId, stats, newlyUnlocked);
        break;
      
      case 'assignment_graded':
        await updateAverageScore(userId, stats);
        await checkPerformanceAchievements(userId, stats, newlyUnlocked, metadata);
        break;
      
      case 'post_created':
        stats.totalPosts += 1;
        await stats.save();
        await checkEngagementAchievements(userId, stats, newlyUnlocked);
        break;
      
      case 'comment_created':
        stats.totalComments += 1;
        await stats.save();
        await checkEngagementAchievements(userId, stats, newlyUnlocked);
        break;
      
      case 'streak_updated':
        await checkStreakAchievements(userId, stats, newlyUnlocked);
        break;
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Check achievements error:', error);
    return newlyUnlocked;
  }
}

// Helper functions for checking specific achievement types
async function checkCourseAchievements(userId, stats, newlyUnlocked) {
  // First course enrollment
  await checkAndUnlockSingle(userId, 'first-course', stats.totalCourses >= 1, newlyUnlocked);
  
  // Course completions
  await checkAndUnlockSingle(userId, 'first-completion', stats.coursesCompleted >= 1, newlyUnlocked);
  await checkAndUnlockSingle(userId, '3-courses', stats.coursesCompleted >= 3, newlyUnlocked);
  await checkAndUnlockSingle(userId, '10-courses', stats.coursesCompleted >= 10, newlyUnlocked);
  
  // Study hours
  await checkAndUnlockSingle(userId, '100-hours', stats.totalStudyHours >= 100, newlyUnlocked);
}

async function checkAssignmentAchievements(userId, stats, newlyUnlocked) {
  // First assignment
  await checkAndUnlockSingle(userId, 'first-assignment', stats.completedAssignments >= 1, newlyUnlocked);
}

async function checkPerformanceAchievements(userId, stats, newlyUnlocked, metadata) {
  const { score, maxScore } = metadata;
  
  if (score && maxScore) {
    const percentage = (score / maxScore) * 100;
    
    // Perfect score
    if (percentage === 100) {
      await checkAndUnlockSingle(userId, 'perfect-score', true, newlyUnlocked);
    }
    
    // High achiever (90%+ average across 5 assignments)
    if (stats.averageScore >= 90 && stats.completedAssignments >= 5) {
      await checkAndUnlockSingle(userId, 'high-achiever', true, newlyUnlocked);
    }
    
    // Overachiever (95%+ on 10 assignments)
    const highScoreSubmissions = await Submission.countDocuments({
      studentId: userId,
      grade: { $gte: 95 }
    });
    
    await checkAndUnlockSingle(userId, 'overachiever', highScoreSubmissions >= 10, newlyUnlocked);
  }
}

async function checkEngagementAchievements(userId, stats, newlyUnlocked) {
  // First post
  await checkAndUnlockSingle(userId, 'first-post', stats.totalPosts >= 1, newlyUnlocked);
  
  // Community contributor
  await checkAndUnlockSingle(userId, '10-posts', stats.totalPosts >= 10, newlyUnlocked);
  await checkAndUnlockSingle(userId, '50-posts', stats.totalPosts >= 50, newlyUnlocked);
  
  // Discussion master
  await checkAndUnlockSingle(userId, '100-comments', stats.totalComments >= 100, newlyUnlocked);
}

async function checkStreakAchievements(userId, stats, newlyUnlocked) {
  await checkAndUnlockSingle(userId, '7-day-streak', stats.currentStreak >= 7, newlyUnlocked);
  await checkAndUnlockSingle(userId, '30-day-streak', stats.currentStreak >= 30, newlyUnlocked);
  await checkAndUnlockSingle(userId, '100-day-streak', stats.currentStreak >= 100, newlyUnlocked);
}

async function checkAndUnlockSingle(userId, achievementId, condition, newlyUnlocked) {
  if (!condition) return;

  const definition = getAchievementDefinition(achievementId);
  if (!definition) return;

  // Check if already unlocked
  const existing = await Achievement.findOne({ userId, achievementId });
  
  if (!existing || !existing.unlocked) {
    // Unlock achievement
    const achievement = await Achievement.findOneAndUpdate(
      { userId, achievementId },
      {
        userId,
        achievementId,
        title: definition.title,
        description: definition.description,
        emoji: definition.emoji,
        category: definition.category,
        rarity: definition.rarity,
        unlocked: true,
        unlockedAt: new Date(),
        progress: 100,
        current: definition.target,
        target: definition.target
      },
      { upsert: true, new: true }
    );

    // Add XP
    const stats = await StudentStats.findOne({ userId });
    if (stats) {
      const leveledUp = stats.addXp(definition.xpReward);
      await stats.save();

      // Create activity for achievement unlock
      await StudentActivity.create({
        userId,
        activityType: 'achievement_unlocked',
        title: `Achievement Unlocked: ${definition.title}`,
        description: definition.description,
        icon: definition.emoji,
        metadata: {
          achievementId,
          xpGained: definition.xpReward
        }
      });

      if (leveledUp) {
        await StudentActivity.create({
          userId,
          activityType: 'level_up',
          title: `Level Up! Now Level ${stats.level}`,
          description: `You've reached level ${stats.level}!`,
          icon: '🎊',
          metadata: {
            level: stats.level,
            xp: stats.xp
          }
        });
      }
    }

    newlyUnlocked.push(achievement);
  }
}

async function updateAverageScore(userId, stats) {
  const submissions = await Submission.find({
    studentId: userId,
    grade: { $exists: true, $ne: null }
  });

  if (submissions.length > 0) {
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0);
    stats.averageScore = totalScore / submissions.length;
    stats.completedAssignments = submissions.length;
    await stats.save();
  }
}

// Export helper function for use in other controllers
module.exports.checkAndUnlockAchievements = checkAndUnlockAchievements;
