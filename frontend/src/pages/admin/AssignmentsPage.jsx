import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  Calendar,
  Users as UsersIcon,
  CheckSquare,
} from 'lucide-react';
import {
  fetchAllAssignments,
  deleteAssignment,
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

const AssignmentsPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { assignments } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    courseId: searchParams.get('courseId') || '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    dispatch(fetchAllAssignments(filters));
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

  const handleDeleteAssignment = async () => {
    try {
      await dispatch(deleteAssignment(selectedAssignment._id)).unwrap();
      addToast('Assignment deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      addToast(error || 'Failed to delete assignment', 'error');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      easy: 'success',
      medium: 'warning',
      hard: 'danger',
    };
    return <Badge variant={variants[difficulty] || 'default'}>{difficulty}</Badge>;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Assignment Management
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all course assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="primary" className="text-sm">
              {assignments.total || 0} Total Assignments
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by assignment title..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
            >
              <option value="">All Courses</option>
              {/* Courses would be populated from Redux state */}
            </Select>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Assignments</p>
                <p className="text-3xl font-bold mt-1">{assignments.total || 0}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active</p>
                <p className="text-3xl font-bold mt-1">
                  {assignments.list.filter((a) => !isOverdue(a.dueDate)).length}
                </p>
              </div>
              <CheckSquare className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Overdue</p>
                <p className="text-3xl font-bold mt-1">
                  {assignments.list.filter((a) => isOverdue(a.dueDate)).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-orange-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold mt-1">
                  {assignments.list.reduce(
                    (sum, a) => sum + (a.submissions?.length || 0),
                    0
                  )}
                </p>
              </div>
              <UsersIcon className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          {assignments.loading && assignments.list.length === 0 ? (
            <div className="py-12 text-center">
              <Loader size="lg" />
            </div>
          ) : assignments.list.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No assignments found"
              description="Try adjusting your filters or wait for tutors to create assignments"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.list.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {assignment.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {assignment.description?.substring(0, 60)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.courseId?.title || 'Unknown Course'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={assignment.courseId?.tutorId?.profilePicture}
                            name={
                              assignment.courseId?.tutorId?.name || 'Unknown'
                            }
                            size="sm"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            {assignment.courseId?.tutorId?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDifficultyBadge(assignment.difficulty)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {assignment.submissions?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            isOverdue(assignment.dueDate)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-900'
                          }`}
                        >
                          {new Date(assignment.dueDate).toLocaleDateString()}
                          {isOverdue(assignment.dueDate) && (
                            <span className="ml-2 text-xs">(Overdue)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/courses/${assignment.courseId?._id}/assignments/${assignment._id}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Assignment"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {assignments.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {assignments.list.length} of {assignments.total}{' '}
                assignments
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={assignments.currentPage === 1}
                  onClick={() =>
                    handleFilterChange('page', assignments.currentPage - 1)
                  }
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {assignments.currentPage} of {assignments.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    assignments.currentPage === assignments.totalPages
                  }
                  onClick={() =>
                    handleFilterChange('page', assignments.currentPage + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {selectedAssignment && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedAssignment(null);
            }}
            title="Delete Assignment"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedAssignment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteAssignment}>
                  Delete Assignment
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <strong>{selectedAssignment.title}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will permanently delete:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                  <li>
                    {selectedAssignment.submissions?.length || 0} student
                    submissions
                  </li>
                  <li>All grades and feedback</li>
                  <li>Assignment files and attachments</li>
                </ul>
              </div>
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

export default AssignmentsPage;
