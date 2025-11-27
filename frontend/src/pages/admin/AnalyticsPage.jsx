import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import {
  fetchPlatformOverview,
  fetchUserGrowth,
  fetchRevenueAnalytics,
  fetchEngagementStats,
} from '../../redux/slices/adminSlice';
import { Card, Loader, Badge } from '../../components/ui';

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { analytics } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchPlatformOverview());
    dispatch(fetchUserGrowth());
    dispatch(fetchRevenueAnalytics());
    dispatch(fetchEngagementStats());
  }, [dispatch]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  // Chart colors
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    indigo: '#6366f1',
  };

  const ROLE_COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('$') 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className={`bg-gradient-to-br from-${color}-500 to-${color}-600 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-100 text-sm`}>{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </p>
          )}
        </div>
        <Icon className={`w-12 h-12 text-${color}-200`} />
      </div>
    </Card>
  );

  if (analytics.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track platform growth, revenue, and user engagement
            </p>
          </div>
          <Badge variant="primary">
            <Calendar className="w-3 h-3 mr-1 inline" />
            Last 30 Days
          </Badge>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={formatNumber(analytics.overview?.stats?.totalUsers)}
            icon={Users}
            color="blue"
            trend="+12% this month"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.overview?.stats?.totalRevenue)}
            icon={DollarSign}
            color="green"
            trend="+8% this month"
          />
          <StatCard
            title="Active Courses"
            value={formatNumber(analytics.overview?.stats?.totalCourses)}
            icon={Activity}
            color="purple"
            trend="+5 new courses"
          />
          <StatCard
            title="Assignments"
            value={formatNumber(analytics.overview?.stats?.totalAssignments)}
            icon={Activity}
            color="orange"
            trend="+15 this month"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Growth (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={
                  analytics.userGrowth?.map((item) => ({
                    month: `${item._id?.month || 'N/A'}/${item._id?.year || ''}`,
                    users: item.count || 0,
                  })) || []
                }
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trends (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  analytics.revenue?.revenueByMonth?.map((item) => ({
                    month: `${item._id?.month || 'N/A'}/${item._id?.year || ''}`,
                    revenue: item.revenue || 0,
                  })) || []
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill={COLORS.success}
                  radius={[8, 8, 0, 0]}
                  name="Revenue ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Engagement Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-blue-600 text-3xl font-bold">
                {formatNumber(analytics.engagement?.totals?.posts || analytics.overview?.stats?.totalPosts)}
              </p>
              <p className="text-gray-600 text-sm mt-2">Total Community Posts</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <p className="text-purple-600 text-3xl font-bold">
                {formatNumber(analytics.engagement?.totals?.likes || 0)}
              </p>
              <p className="text-gray-600 text-sm mt-2">Total Likes</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-green-600 text-3xl font-bold">
                {formatNumber(analytics.engagement?.totals?.comments || 0)}
              </p>
              <p className="text-gray-600 text-sm mt-2">Total Comments</p>
            </div>
          </div>
        </Card>

        {/* Course Performance */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Top Performing Courses (By Revenue)
          </h2>
          <div className="space-y-4">
            {analytics.revenue?.topCourses?.slice(0, 5).map((course, index) => (
              <div
                key={course._id || index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Course ID: {course._id || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {course.enrollments || 0} enrollments
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(course.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-400 py-8">
                No course data available
              </p>
            )}
          </div>
        </Card>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              User Distribution by Role
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Students', value: analytics.overview?.stats?.totalStudents || 0 },
                    { name: 'Tutors', value: analytics.overview?.stats?.totalTutors || 0 },
                    { name: 'Admins', value: (analytics.overview?.stats?.totalUsers || 0) - (analytics.overview?.stats?.totalStudents || 0) - (analytics.overview?.stats?.totalTutors || 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ROLE_COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-1"></div>
                <p className="text-xs text-gray-600">Students</p>
                <p className="font-bold text-gray-900">
                  {formatNumber(analytics.overview?.stats?.totalStudents)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mx-auto mb-1"></div>
                <p className="text-xs text-gray-600">Tutors</p>
                <p className="font-bold text-gray-900">
                  {formatNumber(analytics.overview?.stats?.totalTutors)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mx-auto mb-1"></div>
                <p className="text-xs text-gray-600">Admins</p>
                <p className="font-bold text-gray-900">
                  {formatNumber((analytics.overview?.stats?.totalUsers || 0) - (analytics.overview?.stats?.totalStudents || 0) - (analytics.overview?.stats?.totalTutors || 0))}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Engagement Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={
                  analytics.engagement?.engagementByMonth?.map((item) => ({
                    month: `${item._id?.month || 'N/A'}/${item._id?.year || ''}`,
                    posts: item.posts || 0,
                    interactions: (item.totalLikes || 0) + (item.totalComments || 0),
                  })) || []
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Posts"
                />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  stroke={COLORS.indigo}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Interactions (Likes + Comments)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
