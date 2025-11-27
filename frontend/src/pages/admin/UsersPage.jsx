import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
} from 'lucide-react';
import {
  fetchAllUsers,
  updateUser,
  deleteUser,
  createUser,
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

const UsersPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { users } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    status: searchParams.get('status') || '',
    verified: searchParams.get('verified') || '',
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    verifiedTutor: false,
  });

  useEffect(() => {
    dispatch(fetchAllUsers(filters));
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

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    try {
      await dispatch(createUser(newUser)).unwrap();
      addToast('User created successfully!', 'success');
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        verifiedTutor: false,
      });
    } catch (error) {
      addToast(error || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (updates) => {
    try {
      await dispatch(updateUser({ userId: selectedUser._id, updates })).unwrap();
      addToast('User updated successfully!', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      addToast(error || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await dispatch(deleteUser(selectedUser._id)).unwrap();
      addToast('User deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      addToast(error || 'Failed to delete user', 'error');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      student: 'success',
      tutor: 'primary',
      admin: 'danger',
      superadmin: 'danger',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all users, roles, and permissions
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </Select>

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>

            <Select
              value={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
            >
              <option value="">All Verification</option>
              <option value="true">Verified Tutors</option>
              <option value="false">Unverified</option>
            </Select>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          {users.loading && users.list.length === 0 ? (
            <div className="py-12 text-center">
              <Loader size="lg" />
            </div>
          ) : users.list.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your filters or create a new user"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.list.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={user.avatarUrl || user.profilePicture}
                            name={user.name}
                            size="md"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'tutor' ? (
                          user.verifiedTutor ? (
                            <span className="flex items-center text-blue-600 text-sm">
                              <Shield className="w-4 h-4 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">Not Verified</span>
                          )
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-700"
                            title="Quick Edit"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
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
          {users.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {users.list.length} of {users.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={users.currentPage === 1}
                  onClick={() =>
                    handleFilterChange('page', users.currentPage - 1)
                  }
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {users.currentPage} of {users.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={users.currentPage === users.totalPages}
                  onClick={() =>
                    handleFilterChange('page', users.currentPage + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New User"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {newUser.role === 'tutor' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifiedTutor"
                  checked={newUser.verifiedTutor}
                  onChange={(e) =>
                    setNewUser({ ...newUser, verifiedTutor: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="verifiedTutor"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Verify tutor immediately
                </label>
              </div>
            )}
          </div>
        </Modal>

        {/* Quick Edit Modal */}
        {selectedUser && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            title="Quick Edit User"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const updates = {
                      isActive: !selectedUser.isActive,
                    };
                    if (selectedUser.role === 'tutor') {
                      updates.verifiedTutor = !selectedUser.verifiedTutor;
                    }
                    handleUpdateUser(updates);
                  }}
                >
                  Save Changes
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  User: {selectedUser.name}
                </p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <div className="flex items-center justify-between py-3 border-y">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant={selectedUser.isActive ? 'success' : 'danger'}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {selectedUser.role === 'tutor' && (
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm font-medium">Tutor Verification</span>
                  <Badge variant={selectedUser.verifiedTutor ? 'primary' : 'warning'}>
                    {selectedUser.verifiedTutor ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Click "Save Changes" to toggle status
              </p>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {selectedUser && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            title="Delete User"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteUser}>
                  Delete User
                </Button>
              </>
            }
          >
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>?
              This action cannot be undone.
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
