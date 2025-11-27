import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  Video,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const MyClassesWithZoom = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      // Get user's enrolled courses
      const { data: userData } = await api.get(`/users/${user.id}`);
      
      if (userData.data.enrolledCourses && userData.data.enrolledCourses.length > 0) {
        // Fetch full course details including schedule
        const coursePromises = userData.data.enrolledCourses.map(courseId =>
          api.get(`/courses/${courseId}`)
        );
        const coursesData = await Promise.all(coursePromises);
        setCourses(coursesData.map(res => res.data.data));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async (courseId, scheduleId) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/schedule/${scheduleId}/join`);
      window.open(data.data.join_url, '_blank');
    } catch (error) {
      console.error('Error joining class:', error);
      alert(error.response?.data?.message || 'Failed to get join link');
    }
  };

  const getSessionStatus = (startTime, duration) => {
    const now = new Date();
    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);
    const minutesUntilStart = (sessionStart - now) / 60000;

    if (minutesUntilStart > 15) return 'upcoming';
    if (minutesUntilStart > 0 && minutesUntilStart <= 15) return 'starting-soon';
    if (now >= sessionStart && now <= sessionEnd) return 'live';
    return 'ended';
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'upcoming': 'bg-blue-100 text-blue-700 border-blue-200',
      'starting-soon': 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse',
      'live': 'bg-green-100 text-green-700 border-green-200 animate-pulse',
      'ended': 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const icons = {
      'upcoming': <Calendar className="h-3 w-3" />,
      'starting-soon': <AlertCircle className="h-3 w-3" />,
      'live': <PlayCircle className="h-3 w-3" />,
      'ended': <CheckCircle className="h-3 w-3" />
    };

    const labels = {
      'upcoming': 'Upcoming',
      'starting-soon': 'Starting Soon',
      'live': 'Live Now',
      'ended': 'Ended'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border-2 ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Classes
          </h1>
          <p className="text-gray-600 mt-2">View your enrolled courses and join live sessions</p>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Enroll in a course to start learning</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <BookOpen className="h-5 w-5" />
                Browse Courses
              </Link>
            </div>
          ) : (
            courses.map((course) => {
              const enrollment = course.enrolledStudents?.find(e => e.studentId._id === user.id || e.studentId === user.id);
              const upcomingSessions = course.schedule?.filter(session => {
                const status = getSessionStatus(session.startTime, session.duration);
                return status !== 'ended';
              }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden"
                >
                  {/* Course Header */}
                  <div className="p-6 border-b-2 border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                          {enrollment && (
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              Enrolled
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex flex-wrap gap-4">
                          <span className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            Tutor: {course.tutorId?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-gray-600">
                            <Video className="h-4 w-4" />
                            {upcomingSessions?.length || 0} upcoming sessions
                          </span>
                          {enrollment && (
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                              <TrendingUp className="h-4 w-4" />
                              {enrollment.progress || 0}% complete
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/courses/${course._id}`}
                        className="px-4 py-2 border-2 border-indigo-600 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors"
                      >
                        View Course
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    {enrollment && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                          <span className="text-sm font-semibold text-indigo-600">{enrollment.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upcoming Sessions */}
                  {upcomingSessions && upcomingSessions.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        Upcoming Live Sessions
                      </h4>
                      
                      <div className="space-y-3">
                        {upcomingSessions.map((session) => {
                          const status = getSessionStatus(session.startTime, session.duration);
                          const sessionDate = new Date(session.startTime);
                          const canJoin = status === 'starting-soon' || status === 'live';

                          return (
                            <div
                              key={session._id}
                              className={`bg-white rounded-xl p-4 border-2 ${canJoin ? 'border-green-300 shadow-lg' : 'border-blue-100'} transition-all`}
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
                                {canJoin && (
                                  <button
                                    onClick={() => joinClass(course._id, session._id)}
                                    className={`px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 transition-all ${
                                      status === 'live'
                                        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-xl animate-pulse'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg'
                                    }`}
                                  >
                                    <PlayCircle className="h-5 w-5" />
                                    {status === 'live' ? 'Join Now' : 'Join Class'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No Upcoming Sessions */}
                  {(!upcomingSessions || upcomingSessions.length === 0) && (
                    <div className="bg-gray-50 p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">No upcoming sessions scheduled</p>
                      <p className="text-sm text-gray-500 mt-1">Check back later for new sessions</p>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClassesWithZoom;
