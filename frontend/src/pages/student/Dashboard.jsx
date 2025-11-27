// frontend/src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Video,
  Calendar,
  CheckCircle,
  Target,
  Flame,
  Play,
  ArrowRight,
  ChevronRight,
  Users,
  MessageCircle
} from 'lucide-react';
import api from '../../services/api';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    hoursLearned: 0,
    completionRate: 0,
    currentStreak: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch enrolled courses
      const coursesRes = await api.get('/courses?enrolled=true');
      const courses = coursesRes.data.data || [];
      setEnrolledCourses(courses);

      // Calculate stats
      const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0);
      const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;
      
      setStats({
        coursesEnrolled: courses.length,
        hoursLearned: Math.floor(Math.random() * 100) + 20, // Mock data - replace with real
        completionRate: avgProgress,
        currentStreak: Math.floor(Math.random() * 15) + 1 // Mock data - replace with real
      });

      // Fetch upcoming classes
      const classesPromises = courses.map(course =>
        api.get(`/courses/${course._id}/schedule`).catch(() => ({ data: { data: [] } }))
      );
      const classesResponses = await Promise.all(classesPromises);
      const allClasses = classesResponses
        .flatMap(res => res.data.data || [])
        .filter(cls => new Date(cls.startTime) > new Date())
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5);
      setUpcomingClasses(allClasses);

      // Fetch pending assignments
      const assignmentsRes = await api.get('/assignments/my-submissions').catch(() => ({ data: { data: [] } }));
      const pending = (assignmentsRes.data.data || [])
        .filter(sub => sub.status === 'pending' || !sub.submittedAt)
        .slice(0, 5);
      setPendingAssignments(pending);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-indigo-100">
                Ready to continue your learning journey?
              </p>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="hidden md:flex items-center space-x-3"
            >
              <Link
                to="/community"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </Link>
              <Link
                to="/chat"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Courses Enrolled */}
          <motion.div variants={fadeIn}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-indigo-500/10 dark:shadow-indigo-500/5 p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/50">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.coursesEnrolled}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+2 this month</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Courses Enrolled</h3>
              <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>12% increase</span>
              </div>
            </div>
          </motion.div>

          {/* Hours Learned */}
          <motion.div variants={fadeIn}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-green-500/10 dark:shadow-green-500/5 p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/50">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.hoursLearned}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+8 this week</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Hours Learned</h3>
              <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>18% increase</span>
              </div>
            </div>
          </motion.div>

          {/* Completion Rate */}
          <motion.div variants={fadeIn}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5 p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/50">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg. progress</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Completion Rate</h3>
              <div className="mt-3 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(stats.completionRate)}`}
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div variants={fadeIn}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-orange-500/10 dark:shadow-orange-500/5 p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/50">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">days streak</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Current Streak</h3>
              <div className="mt-3 flex items-center text-xs text-orange-600 dark:text-orange-400">
                <Flame className="h-3 w-3 mr-1" />
                <span>Keep it going!</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses - Spans 2 columns */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  My Courses
                </h2>
                <Link
                  to="/courses"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="p-6">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No courses enrolled yet</p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                    >
                      Browse Courses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 4).map((course, index) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Link
                          to={`/courses/${course._id}`}
                          className="block group"
                        >
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-4 border border-gray-200 dark:border-slate-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                  <Award className="h-3 w-3 mr-1" />
                                  {course.tutorId?.name || 'Unknown Tutor'}
                                </p>
                              </div>
                              <div className="ml-4 flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {course.progress || 0}%
                                  </p>
                                </div>
                                <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="relative w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress || 0}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(course.progress || 0)}`}
                              ></motion.div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Classes & Quick Actions Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Upcoming Classes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Upcoming Classes
                </h2>
              </div>
              <div className="p-4">
                {upcomingClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl flex items-center justify-center">
                      <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming classes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingClasses.slice(0, 3).map((classItem, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Video className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {classItem.topic || 'Live Class'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(classItem.startTime).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        {classItem.join_url && (
                          <a
                            href={classItem.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full inline-flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Join Class
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/courses"
                  className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">Browse Courses</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/community"
                  className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">Community</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">Messages</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              Recent Achievements
            </h2>
            <Link
              to="/profile"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎯', title: 'First Course', desc: 'Enrolled in first course' },
              { icon: '🔥', title: '7 Day Streak', desc: 'Learned for 7 days straight' },
              { icon: '⭐', title: 'Quick Learner', desc: 'Completed 50% of a course' },
              { icon: '👥', title: 'Community Member', desc: 'Made first post' }
            ].map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 text-center"
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{achievement.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
