import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  PaperClipIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Avatar, EmptyState, useToast } from '../../components/ui';
import api from '../../services/api';

const AssignmentDetailPage = () => {
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details
      const assignmentRes = await api.get(`/assignments/${assignmentId}`);
      setAssignment(assignmentRes.data.data);

      if (isStudent) {
        // Fetch student's own submission
        try {
          const submissionRes = await api.get(`/assignments/${assignmentId}/my-submission`);
          setMySubmission(submissionRes.data.data);
        } catch (err) {
          // No submission yet
          console.log('No submission yet');
        }
      } else if (isTutor) {
        // Fetch all submissions for this assignment
        const submissionsRes = await api.get(`/assignments/${assignmentId}/submissions`);
        setAllSubmissions(submissionsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      addToast('Failed to load assignment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = () => {
    if (!assignment) return null;
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    }
    if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false };
    }
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  };

  const getSubmissionStats = () => {
    if (!allSubmissions.length) return { total: 0, submitted: 0, graded: 0, pending: 0 };
    
    return {
      total: allSubmissions.length,
      submitted: allSubmissions.filter(s => s.status === 'submitted').length,
      graded: allSubmissions.filter(s => s.status === 'graded').length,
      pending: allSubmissions.filter(s => !s.submittedAt).length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<DocumentTextIcon className="h-12 w-12" />}
          title="Assignment not found"
          description="The assignment you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  const dueInfo = getDaysUntilDue();
  const stats = getSubmissionStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to={`/courses/${courseId}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  ← Back to Course
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {assignment.courseId?.title || 'Course'}
              </p>
            </div>
            
            {isTutor && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/tutor/assignments/${assignmentId}/edit`)}
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Due Date Banner */}
          {dueInfo && (
            <div
              className={`mt-4 p-4 rounded-lg border ${
                dueInfo.isOverdue
                  ? 'bg-red-50 border-red-200'
                  : new Date(assignment.dueDate) - new Date() < 2 * 24 * 60 * 60 * 1000
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className={`h-5 w-5 mr-2 ${dueInfo.isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${dueInfo.isOverdue ? 'text-red-900' : 'text-gray-900'}`}>
                      {dueInfo.text}
                    </p>
                    <p className="text-xs text-gray-600">
                      Due: {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {isStudent && !mySubmission?.submittedAt && (
                  <Button
                    onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/submit`)}
                    size="sm"
                  >
                    Submit Assignment
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                </div>

                {assignment.rubric && assignment.rubric.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Grading Rubric</h3>
                    <div className="space-y-2">
                      {assignment.rubric.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{item.criterion}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.maxPoints} points</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-semibold">
                        <span className="text-sm">Total Points</span>
                        <span className="text-sm">{assignment.rubric.reduce((sum, item) => sum + item.maxPoints, 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {assignment.files && assignment.files.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {assignment.files.map((file, index) => (
                        <a
                          key={index}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition"
                        >
                          <PaperClipIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-indigo-600 hover:text-indigo-700">
                            {file.fileName}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Student's Submission Status */}
            {isStudent && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h2>
                
                {mySubmission?.submittedAt ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            Submitted on {new Date(mySubmission.submittedAt).toLocaleString()}
                          </p>
                          {mySubmission.isLate && (
                            <p className="text-xs text-yellow-700 mt-1">
                              Late submission - {assignment.lateSubmissionPenalty}% penalty applied
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={mySubmission.status === 'graded' ? 'success' : 'info'}>
                        {mySubmission.status === 'graded' ? 'Graded' : 'Submitted'}
                      </Badge>
                    </div>

                    {mySubmission.status === 'graded' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">Your Score</h3>
                          <span className="text-2xl font-bold text-indigo-600">
                            {mySubmission.score}/{assignment.maxScore || 100}
                          </span>
                        </div>
                        
                        {mySubmission.feedback && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {mySubmission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {mySubmission.text && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Answer</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{mySubmission.text}</p>
                        </div>
                      </div>
                    )}

                    {mySubmission.files && mySubmission.files.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Files</h3>
                        <div className="space-y-2">
                          {mySubmission.files.map((file, index) => (
                            <a
                              key={index}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                            >
                              <PaperClipIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-indigo-600">{file.fileName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {mySubmission.status !== 'graded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/submit`)}
                      >
                        Resubmit Assignment
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ExclamationCircleIcon className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                    <p className="text-gray-600 mb-4">You haven't submitted this assignment yet</p>
                    <Button
                      onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/submit`)}
                    >
                      Submit Assignment
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Tutor: All Submissions */}
            {isTutor && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5" />
                    Student Submissions ({allSubmissions.length})
                  </h2>
                </div>

                {allSubmissions.length === 0 ? (
                  <EmptyState
                    icon={<DocumentTextIcon className="h-12 w-12" />}
                    title="No submissions yet"
                    description="Students haven't submitted this assignment yet."
                  />
                ) : (
                  <div className="space-y-3">
                    {allSubmissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar
                            src={submission.studentId?.profilePicture}
                            name={submission.studentId?.name}
                            size="sm"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {submission.studentId?.name}
                            </p>
                            {submission.submittedAt ? (
                              <p className="text-xs text-gray-500">
                                Submitted {new Date(submission.submittedAt).toLocaleString()}
                              </p>
                            ) : (
                              <p className="text-xs text-yellow-600">Not submitted</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {submission.status === 'graded' ? (
                            <Badge variant="success">
                              {submission.score}/{assignment.maxScore || 100}
                            </Badge>
                          ) : submission.status === 'submitted' ? (
                            <Badge variant="warning">Pending Review</Badge>
                          ) : (
                            <Badge variant="secondary">Not Submitted</Badge>
                          )}

                          {submission.submittedAt && submission.status !== 'graded' && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/tutor/assignments/submissions/${submission._id}/grade`)}
                            >
                              Grade
                            </Button>
                          )}

                          {submission.status === 'graded' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/tutor/assignments/submissions/${submission._id}/grade`)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max Score</span>
                  <span className="font-medium text-gray-900">{assignment.maxScore || 100}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Late Submission</span>
                  <Badge variant={assignment.allowLateSubmission ? 'success' : 'danger'}>
                    {assignment.allowLateSubmission ? 'Allowed' : 'Not Allowed'}
                  </Badge>
                </div>
                {assignment.allowLateSubmission && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Late Penalty</span>
                    <span className="font-medium text-gray-900">{assignment.lateSubmissionPenalty}%</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-gray-600 mb-1">Created by</p>
                  <p className="font-medium text-gray-900">{assignment.tutorId?.name || 'Unknown'}</p>
                </div>
              </div>
            </Card>

            {/* Submission Stats (Tutor only) */}
            {isTutor && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Submission Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-semibold text-gray-900">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Submitted</span>
                    <span className="font-semibold text-blue-600">{stats.submitted}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Graded</span>
                    <span className="font-semibold text-green-600">{stats.graded}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{stats.pending}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
