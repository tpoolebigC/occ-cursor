'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  UserX, 
  Shield, 
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Button, Input } from '~/vibes';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '~/b2b/server-actions';

// Role display helpers
function getRoleLabel(role: string | number): string {
  const r = typeof role === 'string' ? role.toLowerCase() : String(role);
  switch (r) {
    case '1':
    case 'admin': return 'Admin';
    case '2':
    case 'senior_buyer':
    case 'senior buyer': return 'Senior Buyer';
    case '3':
    case 'junior_buyer':
    case 'junior buyer': return 'Junior Buyer';
    case '0':
    case 'b2c': return 'B2C Customer';
    default: return r.charAt(0).toUpperCase() + r.slice(1);
  }
}

function getRoleColor(role: string | number): string {
  const r = typeof role === 'string' ? role.toLowerCase() : String(role);
  switch (r) {
    case '1':
    case 'admin': return 'bg-purple-100 text-purple-800';
    case '2':
    case 'senior_buyer':
    case 'senior buyer': return 'bg-blue-100 text-blue-800';
    case '3':
    case 'junior_buyer':
    case 'junior buyer': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case 'active':
    case '1': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'inactive':
    case '0': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'pending':
    case '2': return <Clock className="w-4 h-4 text-yellow-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
  }
}

function getStatusLabel(status: string | number): string {
  const s = typeof status === 'number' ? String(status) : status?.toLowerCase();
  switch (s) {
    case '1':
    case 'active': return 'Active';
    case '0':
    case 'inactive': return 'Inactive';
    case '2':
    case 'pending': return 'Pending';
    default: return String(status);
  }
}

function getStatusColor(status: string | number): string {
  const s = typeof status === 'number' ? String(status) : status?.toLowerCase();
  switch (s) {
    case '1':
    case 'active': return 'text-green-600';
    case '0':
    case 'inactive': return 'text-red-600';
    case '2':
    case 'pending': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
}

interface B2BUser {
  id: number | string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | number;
  status: string | number;
  companyId: number | string;
  companyName?: string;
  phone?: string;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface UserManagementProps {
  companyId?: string;
}

export function UserManagement({ companyId }: UserManagementProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<B2BUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<B2BUser | null>(null);
  const [showDeleteUser, setShowDeleteUser] = useState<B2BUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUsers({
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? Number(roleFilter) : undefined,
      });

      if (result.error) {
        setError(result.error);
        setUsers([]);
      } else {
        setUsers(result.users as B2BUser[]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Client-side status filter (API may not support it)
  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'all') return true;
    const s = typeof user.status === 'number' ? String(user.status) : user.status?.toLowerCase();
    return s === statusFilter || s === (statusFilter === 'active' ? '1' : statusFilter === 'inactive' ? '0' : '2');
  });

  const handleAddUser = async (userData: { firstName: string; lastName: string; email: string; phone: string; role: string }) => {
    try {
      setActionLoading(true);
      const result = await createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: Number(userData.role),
        phone: userData.phone,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setShowAddUser(false);
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (userData: B2BUser) => {
    try {
      setActionLoading(true);
      const result = await updateUser(Number(userData.id), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setShowEditUser(null);
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number | string) => {
    try {
      setActionLoading(true);
      const result = await deleteUser(Number(userId));

      if (result.error) {
        setError(result.error);
      } else {
        setShowDeleteUser(null);
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button
          onClick={() => setShowAddUser(true)}
          variant="primary"
          size="medium"
          className="flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="senior_buyer">Senior Buyer</option>
              <option value="junior_buyer">Junior Buyer</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-gray-600">
              {filteredUsers.length} of {users.length} users
            </span>
            <button
              onClick={() => loadUsers()}
              className="text-sm text-primary hover:text-primary-shadow"
              title="Refresh"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-highlight flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(String(user.status))}
                        <span className={`ml-2 text-sm font-medium ${getStatusColor(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setShowEditUser(user)}
                          variant="ghost"
                          size="small"
                          className="text-primary hover:text-primary-shadow"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setShowDeleteUser(user)}
                          variant="ghost"
                          size="small"
                          className="text-red-600 hover:text-red-900"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {error ? 'There was an error loading users.' : 'Try adjusting your search or filter criteria.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={handleAddUser}
          loading={actionLoading}
        />
      )}
      {showEditUser && (
        <EditUserModal
          user={showEditUser}
          onClose={() => setShowEditUser(null)}
          onSuccess={handleEditUser}
          loading={actionLoading}
        />
      )}
      {showDeleteUser && (
        <DeleteUserModal
          user={showDeleteUser}
          onClose={() => setShowDeleteUser(null)}
          onSuccess={() => handleDeleteUser(showDeleteUser.id)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// ============================================================================
// Add User Modal
// ============================================================================
function AddUserModal({ onClose, onSuccess, loading }: { 
  onClose: () => void; 
  onSuccess: (userData: { firstName: string; lastName: string; email: string; phone: string; role: string }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'junior_buyer',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <Input
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="junior_buyer">Junior Buyer</option>
                <option value="senior_buyer">Senior Buyer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" onClick={onClose} variant="tertiary" size="medium">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="medium" disabled={loading}>
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Edit User Modal
// ============================================================================
function EditUserModal({ user, onClose, onSuccess, loading }: { 
  user: B2BUser; 
  onClose: () => void; 
  onSuccess: (userData: B2BUser) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    role: String(user.role),
    status: String(user.status),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({ ...user, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <Input
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="junior_buyer">Junior Buyer</option>
                <option value="senior_buyer">Senior Buyer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" onClick={onClose} variant="tertiary" size="medium">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="medium" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Delete User Modal
// ============================================================================
function DeleteUserModal({ user, onClose, onSuccess, loading }: { 
  user: B2BUser; 
  onClose: () => void; 
  onSuccess: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            <UserX className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete <strong>{user.firstName} {user.lastName}</strong> and all their data.
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button onClick={onClose} variant="tertiary" size="medium">
                Cancel
              </Button>
              <Button onClick={onSuccess} variant="danger" size="medium" disabled={loading}>
                {loading ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
