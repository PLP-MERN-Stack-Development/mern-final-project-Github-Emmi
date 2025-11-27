import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpen,
  Star,
  Users,
  Clock,
  Video,
  FileText,
  Award,
  Calendar,
  ExternalLink,
  Play,
  CheckCircle,
} from 'lucide-react';
import { 
  fetchCourseById, 
  enrollCourse, 
  fetchCourseSchedule, 
  rateCourse 
} from '../../redux/slices/courseSlice';
import { 
  Card, 
  Button, 
  Badge, 
  Loader, 
  Modal, 
  Textarea,
  useToast 
} from '../../components/ui';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { currentCourse: course, schedule, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
      dispatch(fetchCourseSchedule(id));
    }
  }, [dispatch, id]);

  const isEnrolled = course?.enrolledStudents?.some(
    (studentId) => studentId === user?._id
  );

  const handleEnroll = async () => {
    if (!user) {
      toast.info('Please login to enroll in this course');
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await dispatch(enrollCourse(id)).unwrap();
      toast.success('Successfully enrolled in course!');
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      await dispatch(rateCourse({ courseId: id, rating, review })).unwrap();
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(5);
      setReview('');
    } catch (error) {
      toast.error(error || 'Failed to submit rating');
    }
  };

  const joinZoomMeeting = (meetingUrl) => {
    window.open(meetingUrl, '_blank');
  };

  if (loading) {
    return <Loader fullScreen text="Loading course details..." />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="bg-white/20 text-white">
                  {course.level}
                </Badge>
                <Badge variant="default" className="bg-white/20 text-white">
                  {course.category}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-indigo-100 mb-6">{course.description}</p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{course.rating?.toFixed(1) || '4.5'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>12 weeks</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div>
              <Card className="bg-white">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {formatPrice(course.price, course.currency)}
                  </div>
                  <p className="text-gray-600">One-time payment</p>
                </div>

                {isEnrolled ? (
                  <div>
                    <Button fullWidth variant="success" disabled>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Enrolled
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      className="mt-2"
                      onClick={() => navigate(`/chat/${course._id}`)}
                    >
                      Go to Course Chat
                    </Button>
                  </div>
                ) : (
                  <Button 
                    fullWidth 
                    loading={enrolling}
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="h-5 w-5 text-gray-400" />
                    <span>Live Zoom classes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span>Assignments & Projects</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-5 w-5 text-gray-400" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['overview', 'syllabus', 'schedule', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {activeTab === 'overview' && (
              <Card>
                <h2 className="text-2xl font-bold mb-4">About this course</h2>
                <p className="text-gray-700 mb-6">{course.description}</p>
                
                <h3 className="text-xl font-bold mb-3">What you'll learn</h3>
                <ul className="space-y-2">
                  {course.syllabus?.slice(0, 5).map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {activeTab === 'syllabus' && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Course Syllabus</h2>
                <div className="space-y-4">
                  {course.syllabus?.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="font-bold text-lg mb-2">
                        Week {index + 1}: {item.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      {item.resources && item.resources.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600">
                          <FileText className="h-4 w-4" />
                          <span>{item.resources.length} resources</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'schedule' && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Upcoming Live Classes</h2>
                {schedule && schedule.length > 0 ? (
                  <div className="space-y-4">
                    {schedule.map((session, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{session.topic}</h3>
                            <p className="text-sm text-gray-600">{session.agenda}</p>
                          </div>
                          <Badge variant="info">{session.duration} min</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(session.startTime).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          
                          {isEnrolled && session.join_url && (
                            <Button
                              size="sm"
                              onClick={() => joinZoomMeeting(session.join_url)}
                              rightIcon={<ExternalLink className="h-4 w-4" />}
                            >
                              Join Class
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No scheduled classes yet. Check back later!
                  </p>
                )}
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Student Reviews</h2>
                  {isEnrolled && (
                    <Button onClick={() => setShowRatingModal(true)}>
                      Write a Review
                    </Button>
                  )}
                </div>
                <p className="text-gray-600 text-center py-8">
                  Reviews coming soon...
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <h3 className="font-bold text-lg mb-4">Instructor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {course.tutor?.name?.[0]?.toUpperCase() || 'T'}
                </div>
                <div>
                  <div className="font-semibold">{course.tutor?.name}</div>
                  <div className="text-sm text-gray-600">Expert Tutor</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{course.tutor?.bio || 'Professional educator with years of experience'}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate this Course"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRating}>Submit Review</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <Textarea
            label="Your Review"
            placeholder="Share your experience with this course..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
