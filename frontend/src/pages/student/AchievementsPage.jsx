import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  Trophy, Flame, Target, TrendingUp, Award, Star, Users, BookOpen,
  Clock, BarChart3, Calendar, Zap, Heart, MessageCircle, CheckCircle,
  Lock, Sparkles, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  fetchStudentAchievements,
  fetchStudentStats,
  fetchLearningAnalytics,
  fetchActivityTimeline,
} from '../../redux/slices/achievementSlice';
import { Card, Loader } from '../../components/ui';

// Achievement rarity colors
const achievementColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-600',
  diamond: 'from-purple-400 to-pink-600',
};

// Animated Number Component
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const spring = useSpring(0, { duration });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

// Achievement Card Component
const AchievementCard = ({ achievement, index }) => {
  const { id, title, description, emoji, rarity, unlocked, unlockedAt, progress, target, current } = achievement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div
        className={`relative rounded-2xl p-6 ${
          unlocked
            ? `bg-gradient-to-br ${achievementColors[rarity]} shadow-xl`
            : 'bg-slate-800/50 backdrop-blur border border-slate-700'
        } transition-all duration-300`}
      >
        {/* Lock overlay for locked achievements */}
        {!unlocked && (
          <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Emoji/Icon */}
        <div className="text-5xl mb-3 text-center">{emoji}</div>

        {/* Title */}
        <h3 className={`text-lg font-bold text-center mb-2 ${unlocked ? 'text-white' : 'text-slate-300'}`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`text-sm text-center mb-3 ${unlocked ? 'text-white/80' : 'text-slate-400'}`}>
          {description}
        </p>

        {/* Progress Bar for partial achievements */}
        {!unlocked && progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{current}/{target}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: index * 0.05 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        )}

        {/* Unlock date */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-center text-white/60 mt-2">
            Unlocked: {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}

        {/* Rarity badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            unlocked ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            {rarity.toUpperCase()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, trendValue, delay, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className={`bg-gradient-to-br ${gradient} p-6 border-0 shadow-2xl`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
            <div className="text-4xl font-bold text-white mb-2">
              <AnimatedNumber value={value} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend === 'up' ? 'text-green-300' : 'text-red-300'
              }`}>
                {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Activity Timeline Item
const ActivityItem = ({ activity, index }) => {
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
        {activity.icon}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold">{activity.title}</h4>
        <p className="text-slate-400 text-sm">{activity.description}</p>
        <p className="text-slate-500 text-xs mt-1">{getRelativeTime(activity.timestamp)}</p>
      </div>
    </motion.div>
  );
};

const AchievementsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { achievements, stats, analytics, activities, loading } = useSelector((state) => state.achievements);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user) {
      dispatch(fetchStudentAchievements(user.id));
      dispatch(fetchStudentStats(user.id));
      dispatch(fetchLearningAnalytics(user.id));
      dispatch(fetchActivityTimeline(user.id));
    }
  }, [dispatch, user]);

  if (loading && !stats) {
    return <Loader fullScreen text="Loading your achievements..." />;
  }

  const categories = ['all', 'First Steps', 'Consistency', 'Progress', 'Engagement', 'Performance'];
  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const xpProgress = stats ? (stats.xp / stats.xpForNextLevel) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-12 md:px-12"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative w-full">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 flex items-center gap-4">
              <Trophy className="w-12 h-12" />
              Your Achievements
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Level {stats?.level || 1} • <AnimatedNumber value={stats?.xp || 0} /> XP
            </p>
          </motion.div>

          {/* XP Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-2xl bg-white/20 rounded-full h-6 overflow-hidden backdrop-blur"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.5, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-end px-3"
            >
              <span className="text-white text-xs font-bold">
                {stats?.xpToNextLevel || 0} XP to Level {(stats?.level || 1) + 1}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <div className="w-full px-8 md:px-12 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
          >
            <BarChart3 className="w-8 h-8 text-indigo-400" />
            Your Stats
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Trophy}
              label="Achievements Unlocked"
              value={`${unlockedCount}/${stats?.totalAchievements || 50}`}
              gradient="from-yellow-500 to-orange-600"
              delay={0.1}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${stats?.currentStreak || 0} days`}
              trend="up"
              trendValue="+3 this week"
              gradient="from-red-500 to-pink-600"
              delay={0.2}
            />
            <StatCard
              icon={Clock}
              label="Total Study Hours"
              value={stats?.totalStudyHours || 0}
              trend="up"
              trendValue="+12 this month"
              gradient="from-blue-500 to-cyan-600"
              delay={0.3}
            />
            <StatCard
              icon={Target}
              label="Average Score"
              value={`${stats?.averageScore || 0}%`}
              trend="up"
              trendValue="+5% this month"
              gradient="from-green-500 to-emerald-600"
              delay={0.4}
            />
          </div>
        </section>

        {/* Achievements Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-white flex items-center gap-2"
            >
              <Award className="w-8 h-8 text-purple-400" />
              Achievements ({unlockedCount}/{stats?.totalAchievements || 50})
            </motion.h2>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} index={index} />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        {analytics && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Learning Progress (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.learningProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      name="Study Hours"
                    />
                    <Line
                      type="monotone"
                      dataKey="assignments"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', r: 4 }}
                      name="Assignments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Course Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  Course Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.courseDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.courseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Assignment Scores Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Assignment Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.assignmentScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {analytics.assignmentScores.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.score >= 90 ? '#10b981' : entry.score >= 70 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </section>
        )}

        {/* AI Insights Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 border border-indigo-500/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            AI-Powered Insights
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Progress Summary</h3>
              <p className="text-slate-300 leading-relaxed">
                You're making excellent progress, {user?.name}! You've unlocked {unlockedCount} achievements 
                and maintained a {stats?.currentStreak}-day learning streak. Your consistency is impressive! 
                Keep pushing forward and you'll unlock even more milestones soon.
              </p>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">Next Milestones</h4>
                <div className="space-y-3">
                  {achievements
                    .filter((a) => !a.unlocked && a.progress > 50)
                    .slice(0, 3)
                    .map((achievement) => (
                      <div key={achievement.id} className="bg-slate-800/50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{achievement.emoji}</span>
                          <div className="flex-1">
                            <p className="text-white font-medium">{achievement.title}</p>
                            <p className="text-slate-400 text-sm">{achievement.progress}% complete</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Recommendations</h3>
              
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="text-white font-medium mb-2">📚 Study Strategies</h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Continue your daily learning streak - consistency is key!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Review completed assignments to reinforce concepts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Engage more in community discussions to unlock social achievements</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="text-white font-medium mb-2">🎯 Focus Areas</h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Complete 2 more courses to unlock "Overachiever"</li>
                  <li>• Maintain your streak for 8 more days to reach 30 days</li>
                  <li>• Create 4 more posts to unlock "Social Butterfly"</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Activity Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-cyan-400" />
            Recent Activity
          </h2>

          <Card className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6">
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <ActivityItem key={activity.id} activity={activity} index={index} />
              ))}
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default AchievementsPage;
