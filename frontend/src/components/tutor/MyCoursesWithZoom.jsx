import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Video,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

const MyCoursesWithZoom = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    topic: '',
    startTime: '',
    duration: 60
  });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/courses?tutor=me');
      setCourses(data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (courseId) => {
    try {
      if (!sessionForm.topic || !sessionForm.startTime) {
        alert('Please fill in all fields');
        return;
      }

      const sessionData = {
        topic: sessionForm.topic,
        startTime: new Date(sessionForm.startTime).toISOString(),
        duration: parseInt(sessionForm.duration)
      };

      await api.post(`/courses/${courseId}/schedule`, sessionData);
      
      // Reset form and close modal
      setSessionForm({ topic: '', startTime: '', duration: 60 });
      setScheduleModal(null);
      
      // Refresh courses
      fetchMyCourses();
      alert('Class session scheduled successfully!');
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert(error.response?.data?.message || 'Failed to schedule class');
    }
  };

  const deleteSchedule = async (courseId, scheduleId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await api.delete(`/courses/${courseId}/schedule/${scheduleId}`);
      fetchMyCourses();
      alert('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete session');
    }
  };

  const getStartUrl = async (courseId, scheduleId) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/schedule/${scheduleId}/start`);
      window.open(data.data.start_url, '_blank');
    } catch (error) {
      console.error('Error getting start URL:', error);
      alert('Failed to get meeting link');
    }
  };

  const getSessionStatus = (startTime, duration) => {
    const now = new Date();
    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);

    if (now < sessionStart) return 'scheduled';
    if (now >= sessionStart && now <= sessionEnd) return 'live';
    return 'ended';
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      live: 'bg-green-100 text-green-700 border-green-200 animate-pulse',
      ended: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };

    const icons = {
      scheduled: <Calendar className="h-3 w-3" />,
      live: <PlayCircle className="h-3 w-3" />,
      ended: <CheckCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border-2 ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-gray-600 mt-2">Manage your courses and live class sessions</p>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Create your first course to get started</p>
              <Link
                to="/courses/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                Create Course
              </Link>
            </div>
          ) : (
            courses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden"
              >
                {/* Course Header */}
                <div className="p-6 border-b-2 border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {course.enrolledStudents?.length || 0} students
                        </span>
                        <span className="flex items-center gap-2 text-sm text-gray-600">
                          <Video className="h-4 w-4" />
                          {course.schedule?.length || 0} sessions
                        </span>
                        <span className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        {expandedCourse === course._id ? 'Hide Schedule' : 'View Schedule'}
                      </button>
                      <button
                        onClick={() => setScheduleModal(course._id)}
                        className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Session
                      </button>
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <AnimatePresence>
                  {expandedCourse === course._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50"
                    >
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Video className="h-5 w-5 text-indigo-600" />
                          Live Class Sessions
                        </h4>
                        
                        {course.schedule && course.schedule.length > 0 ? (
                          <div className="space-y-3">
                            {course.schedule.map((session) => {
                              const status = getSessionStatus(session.startTime, session.duration);
                              const sessionDate = new Date(session.startTime);

                              return (
                                <div
                                  key={session._id}
                                  className="bg-white rounded-xl p-4 border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-semibold text-gray-900">{session.topic}</h5>
                                        <StatusBadge status={status} />
                                      </div>
                                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          {sessionDate.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {sessionDate.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {session.duration} min
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {status === 'scheduled' && (
                                        <button
                                          onClick={() => getStartUrl(course._id, session._id)}
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                          <PlayCircle className="h-4 w-4" />
                                          Start Class
                                        </button>
                                      )}
                                      {status === 'live' && (
                                        <button
                                          onClick={() => getStartUrl(course._id, session._id)}
                                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 animate-pulse"
                                        >
                                          <PlayCircle className="h-4 w-4" />
                                          Join Live
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteSchedule(course._id, session._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No sessions scheduled yet</p>
                            <button
                              onClick={() => setScheduleModal(course._id)}
                              className="mt-4 text-indigo-600 hover:underline"
                            >
                              Schedule your first class
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Schedule Modal */}
        <AnimatePresence>
          {scheduleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setScheduleModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Schedule Live Session</h3>
                  <button
                    onClick={() => setScheduleModal(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Session Topic *
                    </label>
                    <input
                      type="text"
                      value={sessionForm.topic}
                      onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                      placeholder="e.g., Introduction to React Hooks"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={sessionForm.startTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Duration (minutes) *
                    </label>
                    <select
                      value={sessionForm.duration}
                      onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setScheduleModal(null)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => addSchedule(scheduleModal)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Schedule Session
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyCoursesWithZoom;
