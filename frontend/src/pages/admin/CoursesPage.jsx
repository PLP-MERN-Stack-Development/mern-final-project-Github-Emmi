import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  Users as UsersIcon,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAllCourses,
  approveCourse,
  rejectCourse,
  deleteCourse,
} from '../../redux/slices/adminSlice';
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Avatar,
  Badge,
  Loader,
  EmptyState,
  useToast,
} from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

const CoursesPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    tutorId: searchParams.get('tutorId') || '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.list || [];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.tutorId?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter((course) => {
        if (filters.status === 'approved') return course.isApproved && course.isPublished;
        if (filters.status === 'pending') return course.isPublished && !course.isApproved && !course.rejectionReason;
        if (filters.status === 'rejected') return course.rejectionReason;
        if (filters.status === 'draft') return !course.isPublished;
        return true;
      });
    }
    
    return filtered;
  }, [courses.list, filters]);

  useEffect(() => {
    dispatch(fetchAllCourses(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = {};
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) params[k] = newFilters[k];
    });
    setSearchParams(params);
  };

  const handleApproveCourse = async () => {
    try {
      await dispatch(approveCourse(selectedCourse._id)).unwrap();
      addToast('Course approved successfully!', 'success');
      setShowApprovalModal(false);
      setSelectedCourse(null);
      dispatch(fetchAllCourses(filters));
    } catch (error) {
      addToast(error || 'Failed to approve course', 'error');
    }
  };

  const handleRejectCourse = async () => {
    if (!rejectionReason.trim()) {
      addToast('Please provide a reason for rejection', 'error');
      return;
    }
    
    try {
      await dispatch(rejectCourse({ courseId: selectedCourse._id, reason: rejectionReason })).unwrap();
      addToast('Course rejected with feedback sent to tutor', 'success');
      setShowRejectModal(false);
      setSelectedCourse(null);
      setRejectionReason('');
      dispatch(fetchAllCourses(filters));
    } catch (error) {
      addToast(error || 'Failed to reject course', 'error');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await dispatch(deleteCourse(selectedCourse._id)).unwrap();
      addToast('Course deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (error) {
      addToast(error || 'Failed to delete course', 'error');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAllCourses(filters));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusBadge = (course) => {
    if (course.isApproved && course.isPublished) {
      return <Badge variant="success">Approved</Badge>;
    } else if (course.rejectionReason) {
      return <Badge variant="danger">Rejected</Badge>;
    } else if (course.isPublished) {
      return <Badge variant="warning">Pending Review</Badge>;
    } else {
      return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              Course Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">
              Approve, manage, and monitor all platform courses
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex gap-2">
              <Badge variant="warning" className="text-sm px-4 py-2">
                <Clock className="w-4 h-4 mr-1" />
                {courses.list.filter((c) => c.isPublished && !c.isApproved && !c.rejectionReason).length} Pending
              </Badge>
              <Badge variant="danger" className="text-sm px-4 py-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                {courses.list.filter((c) => c.rejectionReason).length} Rejected
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by course title, description, or tutor name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 border-2 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border-2 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
            {(filters.search || filters.status) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex items-center justify-between pt-4 border-t dark:border-gray-700"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({ search: '', status: '', tutorId: '' });
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Courses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl">
            {courses.loading && courses.list.length === 0 ? (
              <div className="py-12 text-center">
                <Loader size="lg" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses found"
                description={
                  filters.search || filters.status
                    ? 'Try adjusting your filters'
                    : 'Wait for tutors to create courses'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Tutor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {filteredCourses.map((course, index) => (
                        <motion.tr
                          key={course._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-3">
                            {course.title?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {course.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {course.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={course.tutorId?.profilePicture}
                            name={course.tutorId?.name || 'Unknown'}
                            size="sm"
                          />
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900">
                              {course.tutorId?.name || 'Unknown Tutor'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {course.tutorId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(course)}
                        {course.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1 max-w-xs truncate" title={course.rejectionReason}>
                            {course.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <UsersIcon className="w-3 h-3 mr-1" />
                            {course.enrolledStudents?.length || 0} students
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <DollarSign className="w-3 h-3 mr-1" />$
                            {course.price || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Course"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {course.isPublished && !course.isApproved && !course.rejectionReason && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setShowApprovalModal(true);
                                }}
                                className="text-green-600 hover:text-green-700"
                                title="Approve Course"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Reject Course"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {course.rejectionReason && (
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowApprovalModal(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                              title="Approve After Review"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowDeleteModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-700"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

          {/* Pagination */}
          {courses.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {courses.list.length} of {courses.total} courses
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={courses.currentPage === 1}
                  onClick={() =>
                    handleFilterChange('page', courses.currentPage - 1)
                  }
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {courses.currentPage} of {courses.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={courses.currentPage === courses.totalPages}
                  onClick={() =>
                    handleFilterChange('page', courses.currentPage + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
            )}
          </Card>
        </motion.div>

        {/* Approval Modal */}
        {selectedCourse && (
          <Modal
            isOpen={showApprovalModal}
            onClose={() => {
              setShowApprovalModal(false);
              setSelectedCourse(null);
            }}
            title="Approve Course"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedCourse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleApproveCourse}>
                  Approve & Publish
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCourse.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCourse.description}
                </p>
              </div>
              {selectedCourse.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Previous Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {selectedCourse.rejectionReason}
                  </p>
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Course Details:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Tutor: {selectedCourse.tutorId?.name}</li>
                  <li>• Price: ${selectedCourse.price}</li>
                  <li>
                    • Created:{' '}
                    {new Date(selectedCourse.createdAt).toLocaleDateString()}
                  </li>
                  {selectedCourse.approvedAt && (
                    <li>
                      • Last Approved:{' '}
                      {new Date(selectedCourse.approvedAt).toLocaleDateString()}
                    </li>
                  )}
                </ul>
              </div>
              <p className="text-xs text-gray-500">
                Approving this course will make it visible to all students and send a notification to the tutor.
              </p>
            </div>
          </Modal>
        )}

        {/* Rejection Modal */}
        {selectedCourse && (
          <Modal
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedCourse(null);
              setRejectionReason('');
            }}
            title="Reject Course"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedCourse(null);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleRejectCourse}>
                  Reject & Notify Tutor
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCourse.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  by {selectedCourse.tutorId?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this course needs improvement (e.g., unclear objectives, poor content structure, missing materials...)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="4"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This feedback will be sent to the tutor to help them improve the course.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  The tutor will be notified and can resubmit the course after making improvements.
                </p>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {selectedCourse && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCourse(null);
            }}
            title="Delete Course"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCourse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteCourse}>
                  Delete Course
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <strong>{selectedCourse.title}</strong>? This will also remove:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>All enrolled students</li>
                <li>All assignments and submissions</li>
                <li>Course materials and content</li>
              </ul>
              <p className="text-sm font-semibold text-red-600">
                This action cannot be undone!
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
