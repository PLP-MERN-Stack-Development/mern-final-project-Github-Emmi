import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  Search,
  RefreshCw,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  fetchAllPayments,
  issueRefund,
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

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { payments } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
  });

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    dispatch(fetchAllPayments(filters));
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

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      addToast('Please provide a refund reason', 'error');
      return;
    }

    try {
      await dispatch(
        issueRefund({ paymentId: selectedPayment._id, reason: refundReason })
      ).unwrap();
      addToast('Refund processed successfully!', 'success');
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundReason('');
    } catch (error) {
      addToast(error || 'Failed to process refund', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: 'success', icon: CheckCircle },
      pending: { variant: 'warning', icon: AlertCircle },
      failed: { variant: 'danger', icon: XCircle },
      refunded: { variant: 'default', icon: RefreshCw },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1 inline" />
        {status}
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: payments.list.reduce((sum, p) => sum + (p.amount || 0), 0),
    completed: payments.list.filter((p) => p.status === 'completed').length,
    refunded: payments.list.filter((p) => p.status === 'refunded').length,
    revenue: payments.list
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8" />
              Payment Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track transactions, revenue, and process refunds
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  ${stats.revenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Completed Payments</p>
                <p className="text-3xl font-bold mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold mt-1">{payments.total || 0}</p>
              </div>
              <CreditCard className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Refunded</p>
                <p className="text-3xl font-bold mt-1">{stats.refunded}</p>
              </div>
              <RefreshCw className="w-12 h-12 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by student or course name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
          </div>
        </Card>

        {/* Payments Table */}
        <Card>
          {payments.loading && payments.list.length === 0 ? (
            <div className="py-12 text-center">
              <Loader size="lg" />
            </div>
          ) : payments.list.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No payments found"
              description="Try adjusting your filters or wait for students to make payments"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.list.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={payment.userId?.profilePicture}
                            name={payment.userId?.name || 'Unknown'}
                            size="sm"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {payment.userId?.name || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.userId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {payment.courseId?.title || 'Unknown Course'}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {payment.courseId?.tutorId?.name || 'Unknown Tutor'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-900">
                          ${payment.amount?.toFixed(2) || '0.00'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRefundModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-700 flex items-center gap-1 ml-auto"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Refund
                          </button>
                        )}
                        {payment.status === 'refunded' && (
                          <span className="text-gray-400 text-xs">
                            Refunded
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {payments.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {payments.list.length} of {payments.total} payments
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={payments.currentPage === 1}
                  onClick={() =>
                    handleFilterChange('page', payments.currentPage - 1)
                  }
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {payments.currentPage} of {payments.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={payments.currentPage === payments.totalPages}
                  onClick={() =>
                    handleFilterChange('page', payments.currentPage + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Refund Modal */}
        {selectedPayment && (
          <Modal
            isOpen={showRefundModal}
            onClose={() => {
              setShowRefundModal(false);
              setSelectedPayment(null);
              setRefundReason('');
            }}
            title="Process Refund"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPayment(null);
                    setRefundReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleRefund}>Process Refund</Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  Payment Details
                </p>
                <div className="mt-2 space-y-1 text-sm text-blue-800">
                  <p>• Student: {selectedPayment.userId?.name}</p>
                  <p>• Course: {selectedPayment.courseId?.title}</p>
                  <p>• Amount: ${selectedPayment.amount?.toFixed(2)}</p>
                  <p>
                    • Date:{' '}
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Explain why this payment is being refunded..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="text-xs text-gray-500">
                This will initiate a refund to the student's payment method
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
