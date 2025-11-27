import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  FunnelIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { fetchMySubmissions, fetchTutorAssignments } from '../../redux/slices/assignmentSlice';
import { Card, Badge, Button, EmptyState, Loader } from '../../components/ui';

const AssignmentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { assignments, mySubmissions, loading } = useSelector((state) => state.assignments);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded, overdue
  
  const isTutor = user?.role === 'tutor' || user?.role === 'admin';

  useEffect(() => {
    if (isTutor) {
      dispatch(fetchTutorAssignments());
    } else {
      dispatch(fetchMySubmissions());
    }
  }, [dispatch, isTutor]);

  const getStatusBadge = (assignment, submission) => {
    if (!submission) {
      const isOverdue = new Date(assignment.dueDate) < new Date();
      if (isOverdue) {
        return <Badge variant="danger">Overdue</Badge>;
      }
      return <Badge variant="warning">Pending</Badge>;
    }

    if (submission.status === 'graded') {
      return <Badge variant="success">Graded</Badge>;
    }

    if (submission.status === 'submitted') {
      return <Badge variant="info">Submitted</Badge>;
    }

    return <Badge variant="secondary">Draft</Badge>;
  };

  const getStatusIcon = (assignment, submission) => {
    if (!submission) {
      const isOverdue = new Date(assignment.dueDate) < new Date();
      if (isOverdue) {
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      }
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }

    if (submission.status === 'graded') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }

    return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    }
    if (diffDays === 0) {
      return 'Due today';
    }
    if (diffDays === 1) {
      return 'Due tomorrow';
    }
    return `Due in ${diffDays} days`;
  };

  // Student view filtering
  const filteredSubmissions = mySubmissions.filter((item) => {
    const assignment = item.assignmentId;
    const submission = item;

    if (filter === 'all') return true;
    if (filter === 'pending') return !submission.submittedAt;
    if (filter === 'submitted') return submission.status === 'submitted';
    if (filter === 'graded') return submission.status === 'graded';
    if (filter === 'overdue') {
      return !submission.submittedAt && new Date(assignment.dueDate) < new Date();
    }
    return true;
  });

  // Tutor view filtering
  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'all') return true;
    if (filter === 'published') return assignment.isPublished;
    if (filter === 'draft') return !assignment.isPublished;
    if (filter === 'pending') return assignment.stats?.pendingSubmissions > 0;
    if (filter === 'overdue') return new Date(assignment.dueDate) < new Date();
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isTutor ? 'My Assignments' : 'Assignments'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isTutor 
                  ? 'Manage assignments for your courses' 
                  : 'Manage and submit your course assignments'}
              </p>
            </div>
            {isTutor && (
              <Button
                onClick={() => navigate('/tutor/assignments/create')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create Assignment
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FunnelIcon className="h-4 w-4" />
              <span>Filter:</span>
            </div>
            {isTutor ? (
              // Tutor filters
              <>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({assignments.length})
                </button>
                <button
                  onClick={() => setFilter('published')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'published'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Published ({assignments.filter(a => a.isPublished).length})
                </button>
                <button
                  onClick={() => setFilter('draft')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'draft'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Draft ({assignments.filter(a => !a.isPublished).length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'pending'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Pending Review ({assignments.filter(a => a.stats?.pendingSubmissions > 0).length})
                </button>
                <button
                  onClick={() => setFilter('overdue')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'overdue'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Overdue ({assignments.filter(a => new Date(a.dueDate) < new Date()).length})
                </button>
              </>
            ) : (
              // Student filters
              <>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({mySubmissions.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'pending'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Pending ({mySubmissions.filter((s) => !s.submittedAt).length})
                </button>
                <button
                  onClick={() => setFilter('submitted')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'submitted'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Submitted ({mySubmissions.filter((s) => s.status === 'submitted').length})
                </button>
                <button
                  onClick={() => setFilter('graded')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'graded'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Graded ({mySubmissions.filter((s) => s.status === 'graded').length})
                </button>
                <button
                  onClick={() => setFilter('overdue')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'overdue'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Overdue (
                  {
                    mySubmissions.filter(
                      (s) => !s.submittedAt && new Date(s.assignmentId?.dueDate) < new Date()
                    ).length
                  }
                  )
                </button>
              </>
            )}
          </div>
        </div>

        {/* Assignment List */}
        {isTutor ? (
          // Tutor View
          filteredAssignments.length === 0 ? (
            <EmptyState
              icon={DocumentTextIcon}
              title="No assignments found"
              description={
                filter === 'all'
                  ? 'You haven\'t created any assignments yet. Click "Create Assignment" to get started!'
                  : `No ${filter} assignments at the moment.`
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/tutor/assignments/${assignment._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {assignment.courseId?.title || 'Unknown Course'}
                            </p>
                          </div>
                          <div className="ml-4">
                            {assignment.isPublished ? (
                              <Badge variant="success">Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>

                        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                              Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="h-4 w-4" />
                            <span>{assignment.stats?.totalSubmissions || 0} submissions</span>
                          </div>

                          {assignment.stats?.pendingSubmissions > 0 && (
                            <div className="flex items-center gap-1 text-yellow-600 font-medium">
                              <ExclamationCircleIcon className="h-4 w-4" />
                              <span>{assignment.stats.pendingSubmissions} pending review</span>
                            </div>
                          )}

                          {assignment.stats?.gradedSubmissions > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>{assignment.stats.gradedSubmissions} graded</span>
                            </div>
                          )}
                        </div>

                        {new Date(assignment.dueDate) < new Date() && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs">
                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                            Assignment overdue
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Max Score: {assignment.maxScore || 100} points
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tutor/assignments/${assignment._id}/submissions`);
                        }}
                      >
                        View Submissions ({assignment.stats?.totalSubmissions || 0})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tutor/assignments/${assignment._id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Student View
          filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={DocumentTextIcon}
              title="No assignments found"
              description={
                filter === 'all'
                  ? 'You have no assignments yet. Check back later!'
                  : `No ${filter} assignments at the moment.`
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((item) => {
              const assignment = item.assignmentId;
              const submission = item;

              return (
                <Card
                  key={item._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/courses/${assignment.courseId?._id}/assignments/${assignment._id}`
                    )
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(assignment, submission)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {assignment.courseId?.title || 'Unknown Course'}
                            </p>
                          </div>
                          <div className="ml-4">{getStatusBadge(assignment, submission)}</div>
                        </div>

                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>

                        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                              {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {!submission.submittedAt && (
                            <div
                              className={`font-medium ${
                                new Date(assignment.dueDate) < new Date()
                                  ? 'text-red-600'
                                  : new Date(assignment.dueDate) - new Date() <
                                    2 * 24 * 60 * 60 * 1000
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {getDaysUntilDue(assignment.dueDate)}
                            </div>
                          )}

                          {submission.submittedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>
                                Submitted on{' '}
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {submission.status === 'graded' && (
                            <div className="flex items-center gap-1 font-medium text-green-600">
                              <span>
                                Score: {submission.score}/{assignment.maxScore || 100}
                              </span>
                            </div>
                          )}
                        </div>

                        {submission.isLate && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs">
                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                            Late submission
                            {assignment.lateSubmissionPenalty > 0 &&
                              ` (${assignment.lateSubmissionPenalty}% penalty applied)`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {assignment.rubric && assignment.rubric.length > 0 && (
                        <span>Rubric: {assignment.rubric.length} criteria</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {!submission.submittedAt && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/courses/${assignment.courseId?._id}/assignments/${assignment._id}/submit`
                            );
                          }}
                        >
                          Submit Assignment
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/courses/${assignment.courseId?._id}/assignments/${assignment._id}`
                          );
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )
        )}
      </div>
    </div>
  );
};

export default AssignmentListPage;
