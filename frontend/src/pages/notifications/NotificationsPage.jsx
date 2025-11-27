import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  MessageSquare,
  Users,
  Award,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
} from '../../redux/slices/notificationSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Button, Badge, EmptyState, Loader, useToast } from '../../components/ui';
import socketService from '../../services/socket';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { notifications, loading, unreadCount } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    dispatch(fetchNotifications(filter === 'unread'));
  }, [dispatch, filter]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
      toast.info(notification.message);
    };

    socketService.onNotification(handleNewNotification);

    return () => {
      socketService.off('newNotification', handleNewNotification);
    };
  }, [dispatch, toast]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      course: BookOpen,
      assignment: AlertCircle,
      message: MessageSquare,
      community: Users,
      achievement: Award,
      class: Calendar,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      course: 'bg-blue-100 text-blue-600',
      assignment: 'bg-yellow-100 text-yellow-600',
      message: 'bg-green-100 text-green-600',
      community: 'bg-purple-100 text-purple-600',
      achievement: 'bg-indigo-100 text-indigo-600',
      class: 'bg-pink-100 text-pink-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your learning journey</p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </Button>
            </div>

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                leftIcon={<CheckCheck className="h-4 w-4" />}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {loading && <Loader text="Loading notifications..." />}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={
              filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
            }
          />
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <Card
                  key={notification._id}
                  className={`transition hover:shadow-lg ${
                    !notification.isRead ? 'border-l-4 border-indigo-600 bg-indigo-50/30' : ''
                  }`}
                  padding="md"
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-full ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium mb-1">
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Mark as read"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Link/CTA */}
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2"
                        >
                          View details →
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
