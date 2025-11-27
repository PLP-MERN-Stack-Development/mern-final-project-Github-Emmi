// Achievement definitions
// This file defines all available achievements in the system

const ACHIEVEMENT_DEFINITIONS = [
  // First Steps
  {
    id: 'first-course',
    title: 'First Steps',
    description: 'Enrolled in your first course',
    emoji: '🎓',
    category: 'First Steps',
    rarity: 'bronze',
    target: 1,
    xpReward: 50
  },
  {
    id: 'first-assignment',
    title: 'Getting Started',
    description: 'Submitted your first assignment',
    emoji: '📝',
    category: 'First Steps',
    rarity: 'bronze',
    target: 1,
    xpReward: 50
  },
  {
    id: 'first-post',
    title: 'Voice Heard',
    description: 'Created your first community post',
    emoji: '💬',
    category: 'First Steps',
    rarity: 'bronze',
    target: 1,
    xpReward: 30
  },
  {
    id: 'profile-complete',
    title: 'All Set Up',
    description: 'Completed your profile with bio and avatar',
    emoji: '✨',
    category: 'First Steps',
    rarity: 'bronze',
    target: 1,
    xpReward: 40
  },

  // Consistency
  {
    id: '7-day-streak',
    title: 'Week Warrior',
    description: 'Achieved a 7-day learning streak',
    emoji: '🔥',
    category: 'Consistency',
    rarity: 'silver',
    target: 7,
    xpReward: 100
  },
  {
    id: '30-day-streak',
    title: 'Monthly Champion',
    description: 'Achieved a 30-day learning streak',
    emoji: '⚡',
    category: 'Consistency',
    rarity: 'gold',
    target: 30,
    xpReward: 500
  },
  {
    id: '100-day-streak',
    title: 'Unstoppable',
    description: 'Achieved a 100-day learning streak',
    emoji: '🌟',
    category: 'Consistency',
    rarity: 'diamond',
    target: 100,
    xpReward: 2000
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Logged in before 7 AM on 10 different days',
    emoji: '🌅',
    category: 'Consistency',
    rarity: 'silver',
    target: 10,
    xpReward: 150
  },

  // Progress
  {
    id: 'first-completion',
    title: 'Course Conqueror',
    description: 'Completed your first course',
    emoji: '🎯',
    category: 'Progress',
    rarity: 'silver',
    target: 1,
    xpReward: 200
  },
  {
    id: '3-courses',
    title: 'Learning Enthusiast',
    description: 'Completed 3 courses',
    emoji: '📚',
    category: 'Progress',
    rarity: 'gold',
    target: 3,
    xpReward: 400
  },
  {
    id: '10-courses',
    title: 'Knowledge Seeker',
    description: 'Completed 10 courses',
    emoji: '🧠',
    category: 'Progress',
    rarity: 'platinum',
    target: 10,
    xpReward: 1000
  },
  {
    id: '100-hours',
    title: 'Century Scholar',
    description: 'Accumulated 100 hours of study time',
    emoji: '⏰',
    category: 'Progress',
    rarity: 'gold',
    target: 100,
    xpReward: 600
  },

  // Engagement
  {
    id: '10-posts',
    title: 'Community Contributor',
    description: 'Created 10 community posts',
    emoji: '🗣️',
    category: 'Engagement',
    rarity: 'silver',
    target: 10,
    xpReward: 150
  },
  {
    id: '50-posts',
    title: 'Social Butterfly',
    description: 'Created 50 community posts',
    emoji: '🦋',
    category: 'Engagement',
    rarity: 'gold',
    target: 50,
    xpReward: 500
  },
  {
    id: '100-comments',
    title: 'Discussion Master',
    description: 'Posted 100 comments',
    emoji: '💭',
    category: 'Engagement',
    rarity: 'gold',
    target: 100,
    xpReward: 400
  },

  // Performance
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Achieved a perfect score on an assignment',
    emoji: '💯',
    category: 'Performance',
    rarity: 'silver',
    target: 1,
    xpReward: 150
  },
  {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Maintained 90%+ average across 5 assignments',
    emoji: '🌟',
    category: 'Performance',
    rarity: 'gold',
    target: 5,
    xpReward: 400
  },
  {
    id: 'overachiever',
    title: 'Overachiever',
    description: 'Scored above 95% on 10 assignments',
    emoji: '🏆',
    category: 'Performance',
    rarity: 'platinum',
    target: 10,
    xpReward: 800
  }
];

// Helper function to get achievement definition by ID
const getAchievementDefinition = (achievementId) => {
  return ACHIEVEMENT_DEFINITIONS.find(def => def.id === achievementId);
};

// Helper function to get all achievement definitions
const getAllAchievementDefinitions = () => {
  return ACHIEVEMENT_DEFINITIONS;
};

module.exports = {
  ACHIEVEMENT_DEFINITIONS,
  getAchievementDefinition,
  getAllAchievementDefinitions
};
