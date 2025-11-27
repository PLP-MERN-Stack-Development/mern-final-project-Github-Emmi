import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DocumentTextIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { submitAssignment } from '../../redux/slices/assignmentSlice';
import { Card, Button, Textarea, FileUpload, Badge, useToast } from '../../components/ui';
import api from '../../services/api';
import socket from '../../services/socket';

const AssignmentSubmitPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { submitting } = useSelector((state) => state.assignments);
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchAssignmentAndSubmission();
  }, [assignmentId]);

  const fetchAssignmentAndSubmission = async () => {
    try {
      setLoading(true);
      // Fetch assignment details
      const assignmentRes = await api.get(`/assignments/${assignmentId}`);
      setAssignment(assignmentRes.data.data);

      // Fetch existing submission if any
      try {
        const submissionRes = await api.get(`/assignments/${assignmentId}/my-submission`);
        const existingSub = submissionRes.data.data;
        setSubmission(existingSub);
        setText(existingSub.text || '');
      } catch (err) {
        // No existing submission
        console.log('No existing submission');
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      addToast('Failed to load assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!text.trim() && files.length === 0) {
      addToast('Please provide either text answer or file attachments', 'error');
      return;
    }

    // Check if already submitted and graded
    if (submission?.status === 'graded') {
      addToast('This assignment has already been graded. You cannot resubmit.', 'error');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('text', text);

    // Append files
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const result = await dispatch(
        submitAssignment({ assignmentId, formData })
      ).unwrap();

      // Emit socket event for real-time notification
      socket.emit('assignment:submitted', {
        assignmentId,
        courseId,
        studentId: user._id,
        studentName: user.name,
        assignmentTitle: assignment.title
      });

      addToast('Assignment submitted successfully!', 'success');
      navigate(`/courses/${courseId}/assignments/${assignmentId}`);
    } catch (error) {
      addToast(error || 'Failed to submit assignment', 'error');
    }
  };

  const getDaysUntilDue = () => {
    if (!assignment) return '';
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

  const dueInfo = getDaysUntilDue();

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
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Assignment not found</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{assignment.courseId?.title}</p>
            </div>
            {submission?.status === 'graded' && (
              <Badge variant="success">Graded</Badge>
            )}
            {submission?.status === 'submitted' && (
              <Badge variant="info">Submitted</Badge>
            )}
          </div>
        </div>

        {/* Due Date Warning */}
        {dueInfo && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              dueInfo.isOverdue
                ? 'bg-red-50 border-red-200'
                : new Date(assignment.dueDate) - new Date() < 2 * 24 * 60 * 60 * 1000
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center">
              {dueInfo.isOverdue ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
              )}
              <div>
                <p className={`text-sm font-medium ${dueInfo.isOverdue ? 'text-red-900' : 'text-gray-900'}`}>
                  {dueInfo.text} - {new Date(assignment.dueDate).toLocaleString()}
                </p>
                {dueInfo.isOverdue && assignment.allowLateSubmission && (
                  <p className="text-xs text-red-700 mt-1">
                    Late submissions accepted with {assignment.lateSubmissionPenalty}% penalty
                  </p>
                )}
                {dueInfo.isOverdue && !assignment.allowLateSubmission && (
                  <p className="text-xs text-red-700 mt-1">
                    Late submissions are not accepted for this assignment
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignment Instructions */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>

          {assignment.rubric && assignment.rubric.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Grading Rubric</h3>
              <div className="space-y-2">
                {assignment.rubric.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.criterion}</span>
                    <span className="font-medium text-gray-900">{item.maxPoints} points</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{assignment.rubric.reduce((sum, item) => sum + item.maxPoints, 0)} points</span>
                </div>
              </div>
            </div>
          )}

          {assignment.files && assignment.files.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
              <div className="space-y-2">
                {assignment.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <PaperClipIcon className="h-4 w-4" />
                    {file.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Previous Submission Info */}
        {submission?.submittedAt && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  You submitted this assignment on {new Date(submission.submittedAt).toLocaleString()}
                </p>
                {submission.status === 'graded' && (
                  <p className="text-sm text-green-700 mt-1">
                    Score: {submission.score}/{assignment.maxScore || 100}
                  </p>
                )}
                {submission.status === 'submitted' && (
                  <p className="text-sm text-green-700 mt-1">
                    Your submission is pending review by the instructor
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        {submission?.status !== 'graded' && (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {submission?.submittedAt ? 'Resubmit Assignment' : 'Your Submission'}
              </h2>

              <div className="space-y-4">
                <Textarea
                  label="Text Answer"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Enter your answer or explanation here..."
                  helpText={`${text.length}/5000 characters`}
                  maxLength={5000}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Attachments
                  </label>
                  <FileUpload
                    files={files}
                    onChange={setFiles}
                    maxFiles={5}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.mp4,.mov,.avi"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload up to 5 files (images, documents, videos). Max 10MB per file.
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                leftIcon={<DocumentTextIcon className="h-5 w-5" />}
              >
                {submission?.submittedAt ? 'Resubmit Assignment' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        )}

        {/* Already Graded Message */}
        {submission?.status === 'graded' && (
          <Card>
            <div className="text-center py-8">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment Graded</h3>
              <p className="text-gray-600 mb-4">
                This assignment has been graded. You cannot make further submissions.
              </p>
              <Button
                onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}`)}
              >
                View Feedback
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmitPage;
