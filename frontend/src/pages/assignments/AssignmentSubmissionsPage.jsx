import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { fetchAssignmentById, fetchAssignmentSubmissions } from '../../redux/slices/assignmentSlice';
import { Card, Badge, Button, Loader, EmptyState } from '../../components/ui';

const AssignmentSubmissionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const { currentAssignment, submissions, loading } = useSelector((state) => state.assignments);
  
  const [filter, setFilter] = useState('all'); // all, submitted, graded, pending
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(assignmentId));
      dispatch(fetchAssignmentSubmissions(assignmentId));
    }
  }, [dispatch, assignmentId]);

  // Calculate statistics
  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    pending: submissions.filter(s => s.status === 'submitted').length,
    averageScore: submissions.filter(s => s.status === 'graded').length > 0
      ? (submissions.filter(s => s.status === 'graded').reduce((acc, s) => acc + s.score, 0) / 
         submissions.filter(s => s.status === 'graded').length).toFixed(1)
      : 0
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    // Filter by status
    if (filter === 'submitted' && submission.status !== 'submitted') return false;
    if (filter === 'graded' && submission.status !== 'graded') return false;
    if (filter === 'pending' && submission.status !== 'submitted') return false;

    // Filter by search term
    if (searchTerm) {
      const studentName = submission.studentId?.name?.toLowerCase() || '';
      const studentEmail = submission.studentId?.email?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return studentName.includes(search) || studentEmail.includes(search);
    }

    return true;
  });

  // Table columns
  const columns = [
    {
      accessorKey: 'studentId.name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {row.original.studentId?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.studentId?.name || 'Unknown Student'}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.studentId?.email || ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <div>
          {row.original.submittedAt ? (
            <>
              <div className="text-sm text-gray-900">
                {new Date(row.original.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(row.original.submittedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </>
          ) : (
            <span className="text-gray-400">Not submitted</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const isLate = row.original.isLate;

        return (
          <div className="flex flex-col gap-1">
            {status === 'graded' && (
              <Badge variant="success">Graded</Badge>
            )}
            {status === 'submitted' && (
              <Badge variant="info">Pending Review</Badge>
            )}
            {!row.original.submittedAt && (
              <Badge variant="secondary">Not Submitted</Badge>
            )}
            {isLate && (
              <Badge variant="warning" className="text-xs">Late</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => {
        const score = row.original.score;
        const maxScore = currentAssignment?.maxScore || 100;

        if (row.original.status !== 'graded') {
          return <span className="text-gray-400">-</span>;
        }

        const percentage = (score / maxScore) * 100;
        let colorClass = 'text-green-600';
        if (percentage < 60) colorClass = 'text-red-600';
        else if (percentage < 80) colorClass = 'text-yellow-600';

        return (
          <div className={`font-semibold ${colorClass}`}>
            {score}/{maxScore}
            <span className="text-xs ml-1">({percentage.toFixed(0)}%)</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === 'submitted' ? (
            <Button
              size="sm"
              onClick={() => navigate(`/tutor/assignments/submissions/${row.original._id}/grade`)}
            >
              Grade
            </Button>
          ) : row.original.status === 'graded' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/tutor/assignments/submissions/${row.original._id}/grade`)}
            >
              Review
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
            >
              View
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredSubmissions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading && !currentAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={DocumentTextIcon}
          title="Assignment not found"
          description="The assignment you're looking for doesn't exist."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/assignments')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-medium"
          >
            ← Back to Assignments
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    {currentAssignment.title}
                  </h1>
                </div>
                <p className="text-gray-600 mb-4">{currentAssignment.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>{currentAssignment.courseId?.title || 'Unknown Course'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      Due: {new Date(currentAssignment.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Max Score: {currentAssignment.maxScore || 100} points</span>
                  </div>
                </div>
              </div>
              <div>
                {currentAssignment.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Submissions', value: stats.total, icon: UserGroupIcon, color: 'indigo' },
            { label: 'Pending Review', value: stats.pending, icon: ClockIcon, color: 'yellow' },
            { label: 'Graded', value: stats.graded, icon: CheckCircleIcon, color: 'green' },
            { label: 'Submitted', value: stats.submitted, icon: DocumentTextIcon, color: 'blue' },
            { label: 'Average Score', value: stats.averageScore, icon: ChartBarIcon, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold text-${stat.color}-600`}>
                      {stat.label === 'Average Score' && stats.graded > 0 ? `${stat.value}%` : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter:</span>
              </div>
              {[
                { label: 'All', value: 'all', count: submissions.length },
                { label: 'Pending Review', value: 'pending', count: stats.pending },
                { label: 'Graded', value: 'graded', count: stats.graded },
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === filterOption.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Submissions Table */}
        <Card>
          <div className="overflow-x-auto">
            {filteredSubmissions.length === 0 ? (
              <EmptyState
                icon={UserGroupIcon}
                title="No submissions found"
                description={
                  filter === 'all'
                    ? 'No students have submitted this assignment yet.'
                    : `No ${filter} submissions at the moment.`
                }
              />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentSubmissionsPage;
