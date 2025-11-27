import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  TrendingDown,
} from 'lucide-react';
import { fetchPlatformOverview, fetchUserGrowth, fetchAllCourses } from '../../redux/slices/adminSlice';
import { Card, Loader, Badge, Button } from '../../components/ui';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import ReactApexChart from 'react-apexcharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, courses } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    dispatch(fetchPlatformOverview());
    dispatch(fetchUserGrowth(6));
    dispatch(fetchAllCourses({ limit: 100 })); // Fetch courses for pending count
  }, [dispatch]);

  if (analytics.loading && !analytics.overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const stats = analytics.overview?.stats || {};
  const recent = analytics.overview?.recent || {};

  // Mock data for charts (in production, this would come from backend)
  const userGrowthData = [20, 35, 45, 60, 75, 90, 100];
  const revenueData = [12000, 19000, 15000, 25000, 22000, 30000, 35000];
  const courseEnrollmentData = [5, 8, 12, 15, 20, 25, 30];

  // Chart options for ApexCharts
  const userGrowthChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    colors: ['#6366f1', '#8b5cf6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af' } }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'light',
      x: { show: true }
    }
  };

  const userGrowthChartSeries = [
    { name: 'Students', data: [30, 40, 35, 50, 49, 60, 70] },
    { name: 'Tutors', data: [10, 15, 12, 18, 20, 25, 28] }
  ];

  const revenueChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `₦${val}k`,
      offsetY: -20,
      style: { fontSize: '12px', colors: ['#374151'] }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: {
      labels: {
        formatter: (val) => `₦${val}k`,
        style: { colors: '#9ca3af' }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    }
  };

  const revenueChartSeries = [
    { name: 'Revenue', data: [12, 19, 15, 25, 22, 30, 35] }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
      change: '+12.5%',
      isPositive: true,
      sparklineData: userGrowthData,
      sparklineColor: '#3b82f6'
    },
    {
      title: 'Students',
      value: stats.totalStudents || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      link: '/admin/users?role=student',
      change: '+8.3%',
      isPositive: true,
      sparklineData: [15, 22, 18, 30, 28, 35, 40],
      sparklineColor: '#22c55e'
    },
    {
      title: 'Tutors',
      value: stats.totalTutors || 0,
      icon: UserPlus,
      color: 'bg-purple-500',
      link: '/admin/users?role=tutor',
      change: '+5.2%',
      isPositive: true,
      sparklineData: [5, 8, 10, 12, 15, 18, 20],
      sparklineColor: '#a855f7'
    },
    {
      title: 'Courses',
      value: stats.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-indigo-500',
      link: '/admin/courses',
      change: '+15.7%',
      isPositive: true,
      sparklineData: courseEnrollmentData,
      sparklineColor: '#6366f1'
    },
    {
      title: 'Assignments',
      value: stats.totalAssignments || 0,
      icon: FileText,
      color: 'bg-orange-500',
      link: '/admin/assignments',
      change: '+20.1%',
      isPositive: true,
      sparklineData: [8, 12, 15, 18, 22, 28, 35],
      sparklineColor: '#f97316'
    },
    {
      title: 'Community Posts',
      value: stats.totalPosts || 0,
      icon: Activity,
      color: 'bg-pink-500',
      link: '/admin/feed-moderation',
      change: '-2.4%',
      isPositive: false,
      sparklineData: [45, 42, 38, 40, 35, 32, 30],
      sparklineColor: '#ec4899'
    },
    {
      title: 'Total Revenue',
      value: `₦${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      link: '/admin/payments',
      change: '+28.4%',
      isPositive: true,
      sparklineData: revenueData,
      sparklineColor: '#10b981'
    },
    {
      title: 'Analytics',
      value: 'View Reports',
      icon: TrendingUp,
      color: 'bg-cyan-500',
      link: '/admin/analytics',
      change: '',
      isPositive: true,
      sparklineData: [],
      sparklineColor: '#06b6d4'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Manage your EmmiDev-CodeBridge platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={stat.link}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                        {stat.change && (
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            stat.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.isPositive ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            )}
                            <span>{stat.change}</span>
                          </div>
                        )}
                      </div>
                      <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    {stat.sparklineData && stat.sparklineData.length > 0 && (
                      <div className="h-12 -mx-4 -mb-4">
                        <Sparklines data={stat.sparklineData} margin={6}>
                          <SparklinesLine
                            style={{ strokeWidth: 3, stroke: stat.sparklineColor, fill: 'none' }}
                          />
                          <SparklinesSpots
                            style={{ fill: stat.sparklineColor }}
                            size={2}
                          />
                        </Sparklines>
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Pending Course Approvals */}
        {courses.list && courses.list.filter((c) => c.isPublished && !c.isApproved && !c.rejectionReason).length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Pending Course Approvals
                    <Badge variant="warning">
                      {courses.list.filter((c) => c.isPublished && !c.isApproved && !c.rejectionReason).length}
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Review and approve courses to make them visible to students
                  </p>
                </div>
              </div>
              <Link to="/admin/courses?status=pending">
                <Button size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.list
                .filter((c) => c.isPublished && !c.isApproved && !c.rejectionReason)
                .slice(0, 4)
                .map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          by {course.tutorId?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant="warning" className="ml-2">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>₦{course.price?.toLocaleString() || 0}</span>
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link 
                      to={`/admin/courses`}
                      className="block w-full text-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      Review Course
                    </Link>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Rejected Courses Alert */}
        {courses.list && courses.list.filter((c) => c.rejectionReason).length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Rejected Courses Awaiting Review
                    <Badge variant="danger">
                      {courses.list.filter((c) => c.rejectionReason).length}
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-600">
                    These courses were rejected and may need re-review after tutor updates
                  </p>
                </div>
              </div>
              <Link to="/admin/courses?status=rejected">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekly user registrations</p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <ReactApexChart
                options={userGrowthChartOptions}
                series={userGrowthChartSeries}
                type="area"
                height={350}
              />
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily revenue breakdown</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+28.4%</span>
                </div>
              </div>
              <ReactApexChart
                options={revenueChartOptions}
                series={revenueChartSeries}
                type="bar"
                height={350}
              />
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Recent Users
                </h3>
                <Link
                  to="/admin/users"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View All
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recent.users?.length > 0 ? (
                  recent.users.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.role === 'tutor'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : user.role === 'admin'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent users</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Recent Courses
                </h3>
                <Link
                  to="/admin/courses"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View All
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recent.courses?.length > 0 ? (
                  recent.courses.map((course, index) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {course.title?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{course.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {course.tutorId?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent courses</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/users/create"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center transition-all hover:scale-105 group"
              >
                <UserPlus className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium">Add User</p>
              </Link>
              <Link
                to="/admin/courses"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center transition-all hover:scale-105 group"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium">Manage Courses</p>
              </Link>
              <Link
                to="/admin/payments"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center transition-all hover:scale-105 group"
              >
                <DollarSign className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium">View Payments</p>
              </Link>
              <Link
                to="/admin/analytics"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center transition-all hover:scale-105 group"
              >
                <TrendingUp className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium">Analytics</p>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
