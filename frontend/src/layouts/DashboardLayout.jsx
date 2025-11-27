import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Award,
  Trophy,
  Users,
  FileText,
  Settings,
  Sparkles,
  DollarSign,
  BarChart3,
  Shield,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { Avatar, Badge } from '../components/ui';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Community', path: '/community', icon: Users },
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Chat', path: '/chat', icon: MessageSquare },
      { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
      { name: 'Profile', path: '/profile', icon: User },
    ];

    const roleItems = {
      student: [
        { name: 'Dashboard', path: '/student/dashboard', icon: Home },
        { name: 'Achievements', path: '/student/achievements', icon: Trophy },
        ...commonItems,
      ],
      tutor: [
        { name: 'Dashboard', path: '/tutor/dashboard', icon: Home },
        { name: 'Community', path: '/community', icon: Users },
        { name: 'Courses', path: '/courses', icon: BookOpen },
        { name: 'My Courses', path: '/my-courses', icon: BookOpen },
        { name: 'Chat', path: '/chat', icon: MessageSquare },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
        { name: 'Assignments', path: '/tutor/assignments', icon: FileText },
        { name: 'Profile', path: '/profile', icon: User },
      ],
      admin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Courses', path: '/admin/courses', icon: BookOpen },
        { name: 'Assignments', path: '/admin/assignments', icon: FileText },
        { name: 'Payments', path: '/admin/payments', icon: DollarSign },
        { name: 'Feed Moderation', path: '/admin/feed-moderation', icon: Shield },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ],
      superadmin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Courses', path: '/admin/courses', icon: BookOpen },
        { name: 'Assignments', path: '/admin/assignments', icon: FileText },
        { name: 'Payments', path: '/admin/payments', icon: DollarSign },
        { name: 'Feed Moderation', path: '/admin/feed-moderation', icon: Shield },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    };

    return roleItems[user?.role] || commonItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden mr-2 text-gray-600 hover:text-gray-900"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <Link to="/" className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  EmmiDev CodeBridge
                </span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <Avatar src={user?.avatar} name={user?.name} size="md" />
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white shadow-sm overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <Badge variant="danger" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                      active
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <Badge variant="danger" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 mt-16">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
