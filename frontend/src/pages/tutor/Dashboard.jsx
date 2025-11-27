// frontend/src/pages/tutor/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  Video,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Play,
  Award,
  MessageCircle,
  BarChart3,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import ReactApexChart from 'react-apexcharts';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TutorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 125000,
    earningsThisMonth: 45000,
    pendingEarnings: 12000,
    avgRating: 4.8,
    completionRate: 87,
    responseTime: 2.5,
    pendingGrading: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: 1,
      title: 'MERN Stack - Live Session',
      date: '2025-01-20',
      time: '10:00 AM',
      students: 24,
      duration: '2 hours'
    },
    {
      id: 2,
      title: 'JavaScript Advanced Topics',
      date: '2025-01-22',
      time: '2:00 PM',
      students: 18,
      duration: '1.5 hours'
    },
    {
      id: 3,
      title: 'React Hooks Workshop',
      date: '2025-01-25',
      time: '4:00 PM',
      students: 32,
      duration: '3 hours'
    }
  ]);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'enrollment', student: 'John Doe', course: 'MERN Stack', time: '2 hours ago' },
    { id: 2, type: 'question', student: 'Jane Smith', course: 'React Native', time: '5 hours ago' },
    { id: 3, type: 'submission', student: 'Mike Wilson', course: 'Python DS', time: '1 day ago' }
  ]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart data
  const earningsData = [
    { month: 'Jan', amount: 32000 },
    { month: 'Feb', amount: 38000 },
    { month: 'Mar', amount: 35000 },
    { month: 'Apr', amount: 42000 },
    { month: 'May', amount: 40000 },
    { month: 'Jun', amount: 45000 },
  ];

  const studentEnrollmentData = [
    { week: 'Week 1', students: 15 },
    { week: 'Week 2', students: 22 },
    { week: 'Week 3', students: 18 },
    { week: 'Week 4', students: 28 },
  ];

  const coursePerformanceData = [
    { name: 'MERN Stack', students: 124, rating: 4.8 },
    { name: 'React Native', students: 98, rating: 4.6 },
    { name: 'Python DS', students: 156, rating: 4.9 },
    { name: 'JavaScript', students: 89, rating: 4.7 },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch tutor's courses
      const coursesRes = await api.get('/courses?tutor=me');
      const coursesData = coursesRes.data.data || [];
      setCourses(coursesData);

      // Calculate stats
      const totalStudents = coursesData.reduce(
        (acc, course) => acc + (course.enrolledStudents?.length || 0),
        0
      );

      // Fetch pending submissions
      const submissionsRes = await api.get('/assignments/tutor/pending-submissions').catch(() => ({ data: { data: [] } }));
      const pendingGrading = submissionsRes.data.data?.length || 0;

      setStats(prev => ({
        ...prev,
        totalCourses: coursesData.length,
        totalStudents,
        pendingGrading
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user?.verifiedTutor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Verification Pending</h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Your tutor account is pending verification by our admin team. You'll be able to create
            courses once your account is verified.
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This usually takes 24-48 hours. We'll send you an email once you're verified.
          </p>
          <Link
            to="/community"
            className="mt-6 inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
          >
            Explore Community
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.name}! 👨‍🏫
              </h1>
              <p className="mt-2 text-indigo-100">
                Manage your courses and empower students
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium hover:bg-white/30 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/community"
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium hover:bg-white/30 transition-all hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Community
              </Link>
              <Link
                to="/courses/create"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white text-indigo-600 font-medium hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Earnings Overview */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Earnings */}
          <motion.div variants={fadeIn} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20 transition-all p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="mt-2 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  ₦{stats.totalEarnings.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center text-sm text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>All time</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/50">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* This Month */}
          <motion.div variants={fadeIn} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  ₦{stats.earningsThisMonth.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>32% increase</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/50">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Pending Earnings */}
          <motion.div variants={fadeIn} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 transition-all p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  ₦{stats.pendingEarnings.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Processing</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/50">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Performance Stats with Circular Progress */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Students with Sparkline */}
          <motion.div 
            variants={fadeIn} 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all p-6 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+18%</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/50">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="h-12 -mx-6 -mb-6">
              <Sparklines data={[15, 22, 18, 28, 32, 38, 42]}>
                <SparklinesLine style={{ strokeWidth: 3, stroke: '#6366f1', fill: 'none' }} />
                <SparklinesSpots style={{ fill: '#6366f1' }} size={2} />
              </Sparklines>
            </div>
          </motion.div>

          {/* Average Rating with Circular Progress */}
          <motion.div 
            variants={fadeIn}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-yellow-500/10 hover:shadow-xl hover:shadow-yellow-500/20 transition-all p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Rating</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16">
                    <CircularProgressbar
                      value={stats.avgRating * 20}
                      text={stats.avgRating.toString()}
                      styles={buildStyles({
                        textSize: '28px',
                        pathColor: '#facc15',
                        textColor: '#eab308',
                        trailColor: '#e5e7eb',
                      })}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Excellent</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Completion Rate with Circular Progress */}
          <motion.div 
            variants={fadeIn}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Completion</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16">
                    <CircularProgressbar
                      value={stats.completionRate}
                      text={`${stats.completionRate}%`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: '#a855f7',
                        textColor: '#9333ea',
                        trailColor: '#e5e7eb',
                      })}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Great rate!</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Response Time with Sparkline */}
          <motion.div 
            variants={fadeIn}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/20 transition-all p-6 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.responseTime}</p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">hrs</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">15% faster</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg shadow-teal-500/50">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="h-12 -mx-6 -mb-6">
              <Sparklines data={[4.5, 3.8, 3.2, 2.9, 2.5, 2.3, 2.5]}>
                <SparklinesLine style={{ strokeWidth: 3, stroke: '#14b8a6', fill: 'none' }} />
                <SparklinesSpots style={{ fill: '#14b8a6' }} size={2} />
              </Sparklines>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>
                </div>
                <Link
                  to="/courses/create"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium flex items-center gap-1"
                >
                  Create New
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-4">
                      <BookOpen className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Start creating your first course to share knowledge
                    </p>
                    <Link
                      to="/courses/create"
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Course
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 3).map((course) => (
                      <motion.div
                        key={course._id}
                        whileHover={{ scale: 1.01 }}
                        className="group relative border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl transition-all bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-white" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                              {course.description}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Users className="h-4 w-4 mr-1.5" />
                                <span className="font-medium">{course.enrolledStudents?.length || 0}</span>
                                <span className="ml-1 text-gray-500 dark:text-gray-400">students</span>
                              </div>
                              <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                {course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Link
                              to={`/courses/${course._id}`}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all"
                            >
                              View
                            </Link>
                            <Link
                              to={`/tutor/courses/${course._id}/edit`}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {courses.length > 3 && (
                      <Link
                        to="/tutor/courses"
                        className="block w-full text-center py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all"
                      >
                        View all {courses.length} courses →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Charts Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Trend Chart - Recharts */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings Trend</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue breakdown</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => `₦${value.toLocaleString()}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#earningsGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Student Enrollment Chart - Recharts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Enrollments</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Weekly student growth</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    <ArrowUp className="w-4 h-4" />
                    <span>+23%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={studentEnrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`${value} students`, 'Enrolled']}
                    />
                    <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Course Performance Chart - Recharts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Performance</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student enrollment vs ratings</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coursePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 5]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} name="Students" />
                  <Bar yAxisId="right" dataKey="rating" fill="#facc15" radius={[8, 8, 0, 0]} name="Rating" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'enrollment' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'question' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {activity.type === 'enrollment' && <Users className="h-5 w-5 text-green-600 dark:text-green-400" />}
                        {activity.type === 'question' && <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        {activity.type === 'submission' && <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.type === 'enrollment' && `${activity.student} enrolled in ${activity.course}`}
                          {activity.type === 'question' && `${activity.student} asked a question in ${activity.course}`}
                          {activity.type === 'submission' && `${activity.student} submitted work in ${activity.course}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Sessions</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl border border-green-200 dark:border-green-900/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{session.title}</h4>
                        <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.time} • {session.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{session.students} students</span>
                          </div>
                        </div>
                        <button className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all">
                          <Video className="h-4 w-4" />
                          Join Class
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/tutor/schedule-class"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5" />
                    <span className="font-medium">Schedule Class</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
                <Link
                  to="/tutor/assignments"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <span className="font-medium block">Grade Assignments</span>
                      {stats.pendingGrading > 0 && (
                        <span className="text-xs opacity-90">{stats.pendingGrading} pending</span>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
                <Link
                  to="/tutor/students"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">View Students</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
                <Link
                  to="/tutor/analytics"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">Analytics</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </div>
            </div>

            {/* Pending Actions Alert */}
            {stats.pendingGrading > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Action Required</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      You have {stats.pendingGrading} assignment{stats.pendingGrading > 1 ? 's' : ''} waiting for review.
                    </p>
                    <Link
                      to="/tutor/assignments"
                      className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-all"
                    >
                      Review Now
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
