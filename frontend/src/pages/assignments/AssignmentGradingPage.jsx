import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { gradeSubmission } from '../../redux/slices/assignmentSlice';
import { Card, Button, Input, Textarea, Badge, Avatar, useToast } from '../../components/ui';
import api from '../../services/api';
import socket from '../../services/socket';

const AssignmentGradingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId, assignmentId, submissionId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { grading } = useSelector((state) => state.assignments);
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchSubmissionData();
  }, [submissionId]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      const [assignmentRes, submissionRes] = await Promise.all([
        api.get(`/assignments/${assignmentId}`),
        api.get(`/assignments/submissions/${submissionId}`)
      ]);

      setAssignment(assignmentRes.data.data);
      setSubmission(submissionRes.data.data);

      // Pre-fill if already graded
      if (submissionRes.data.data.status === 'graded') {
        setScore(submissionRes.data.data.score || '');
        setFeedback(submissionRes.data.data.feedback || '');
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      addToast('Failed to load submission details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAIPreGrade = async () => {
    try {
      setLoadingAI(true);
      const response = await api.post('/ai/pregrade', {
        assignmentDescription: assignment.description,
        submissionText: submission.text,
        totalPoints: assignment.totalPoints
      });

      setAiSuggestion(response.data.data);
      addToast('AI pre-grade suggestion generated!', 'success');
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      addToast('Failed to get AI suggestion', 'error');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleApplyAISuggestion = () => {
    if (aiSuggestion) {
      setScore(aiSuggestion.suggestedScore);
      setFeedback(aiSuggestion.feedback);
      addToast('AI suggestion applied!', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!score || score < 0 || score > assignment.totalPoints) {
      addToast(`Score must be between 0 and ${assignment.totalPoints}`, 'error');
      return;
    }

    if (!feedback.trim()) {
      addToast('Please provide feedback', 'error');
      return;
    }

    try {
      await dispatch(
        gradeSubmission({
          submissionId,
          score: Number(score),
          feedback
        })
      ).unwrap();

      // Emit socket event for real-time notification
      socket.emit('assignment:graded', {
        assignmentId,
        submissionId,
        studentId: submission.student._id,
        studentName: submission.student.name,
        score,
        totalPoints: assignment.totalPoints,
        assignmentTitle: assignment.title
      });

      addToast('Submission graded successfully!', 'success');
      navigate(`/courses/${courseId}/assignments/${assignmentId}`);
    } catch (error) {
      addToast(error || 'Failed to grade submission', 'error');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPassing = (currentScore) => {
    return currentScore >= assignment?.passingGrade;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!assignment || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Submission not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}`)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Assignment
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
              <p className="text-gray-600 mt-1">{assignment.title}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={submission.student.profilePicture}
                    alt={submission.student.name}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{submission.student.name}</h3>
                    <p className="text-sm text-gray-600">{submission.student.email}</p>
                  </div>
                </div>
                <Badge variant={submission.status === 'graded' ? 'success' : 'warning'}>
                  {submission.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Submitted On</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    {formatDate(submission.submittedAt)}
                  </p>
                </div>
                {submission.status === 'graded' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Score</p>
                    <p className="text-sm font-medium">
                      <span className={isPassing(submission.score) ? 'text-green-600' : 'text-red-600'}>
                        {submission.score}
                      </span>
                      /{assignment.totalPoints}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Submission Content */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Student's Answer
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.text}</p>
              </div>

              {/* Attachments */}
              {submission.files && submission.files.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <PaperClipIcon className="w-4 h-4" />
                    Attachments ({submission.files.length})
                  </h4>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <PaperClipIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-600 hover:underline">
                          {file.originalName || `Attachment ${index + 1}`}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Assignment Instructions */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Assignment Instructions</h3>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{assignment.description}</p>
            </Card>
          </div>

          {/* Sidebar - Grading Form */}
          <div className="space-y-6">
            {/* AI Pre-Grade */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI Assistant</h3>
              </div>
              <p className="text-sm text-purple-800 mb-4">
                Get an AI-powered pre-grade suggestion based on the assignment requirements and student's answer.
              </p>
              <Button
                onClick={handleAIPreGrade}
                disabled={loadingAI}
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                {loadingAI ? 'Analyzing...' : 'Get AI Suggestion'}
              </Button>

              {aiSuggestion && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">AI Suggestion</p>
                    <span className="text-lg font-bold text-purple-600">
                      {aiSuggestion.suggestedScore}/{assignment.totalPoints}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{aiSuggestion.feedback}</p>
                  <Button
                    onClick={handleApplyAISuggestion}
                    size="sm"
                    className="w-full"
                  >
                    Apply Suggestion
                  </Button>
                </div>
              )}
            </Card>

            {/* Grading Form */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Grade Submission</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (out of {assignment.totalPoints}) *
                  </label>
                  <Input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min="0"
                    max={assignment.totalPoints}
                    step="0.5"
                    placeholder="Enter score"
                    required
                  />
                  {score && (
                    <p className="text-xs mt-1">
                      {isPassing(Number(score)) ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          Passing grade
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircleIcon className="w-3 h-3" />
                          Below passing grade ({assignment.passingGrade})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback *
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide detailed feedback on the submission..."
                    rows={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about what was done well and areas for improvement
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={grading}
                  className="w-full"
                >
                  {grading ? 'Submitting Grade...' : 'Submit Grade'}
                </Button>
              </form>
            </Card>

            {/* Grading Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Grading Tips</h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• Be fair and consistent across all submissions</li>
                <li>• Provide constructive feedback that helps students improve</li>
                <li>• Use the AI assistant to save time on initial assessment</li>
                <li>• Review attachments thoroughly before finalizing</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGradingPage;
