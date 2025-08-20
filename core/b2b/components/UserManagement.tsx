'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  UserX, 
  Shield, 
  Building, 
  Mail, 
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Search,
  Filter
} from 'lucide-react';
import { Button, Input } from '~/vibes';

// Client-safe enums and types
export enum CustomerRole {
  B2C = 0,           // Standard customer
  ADMIN = 1,         // Company admin
  SENIOR_BUYER = 2,  // Senior buyer
  JUNIOR_BUYER = 3,  // Junior buyer
  CUSTOM_ROLE = 4,   // Custom role
  SUPER_ADMIN = 100  // System admin
}

interface B2BUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: CustomerRole;
  status: 'active' | 'inactive' | 'pending';
  companyId: number;
  companyName: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

interface UserManagementProps {
  companyId?: number;
}

export function UserManagement({ companyId }: UserManagementProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<B2BUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<B2BUser | null>(null);
  const [showDeleteUser, setShowDeleteUser] = useState<B2BUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<CustomerRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  // Check if current user has admin permissions (simplified for now)
  const canManageUsers = session?.user?.email?.includes('admin') || true; // TODO: Implement proper permission check
  const canAddUsers = canManageUsers;
  const canEditUsers = canManageUsers;
  const canDeleteUsers = canManageUsers;

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
    }
  }, [canManageUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implement with Catalyst client and proper API
      const mockUsers: B2BUser[] = [
        {
          id: 1,
          email: 'john.smith@company.com',
          firstName: 'John',
          lastName: 'Smith',
          role: CustomerRole.ADMIN,
          status: 'active',
          companyId: 1,
          companyName: 'Acme Corp',
          phone: '+1-555-0123',
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2023-06-01T00:00:00Z',
          permissions: ['orders', 'quotes', 'shopping_lists', 'user_management']
        },
        {
          id: 2,
          email: 'jane.doe@company.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role: CustomerRole.SENIOR_BUYER,
          status: 'active',
          companyId: 1,
          companyName: 'Acme Corp',
          phone: '+1-555-0124',
          lastLogin: '2024-01-14T15:45:00Z',
          createdAt: '2023-08-15T00:00:00Z',
          permissions: ['orders', 'quotes', 'shopping_lists']
        },
        {
          id: 3,
          email: 'bob.wilson@company.com',
          firstName: 'Bob',
          lastName: 'Wilson',
          role: CustomerRole.JUNIOR_BUYER,
          status: 'active',
          companyId: 1,
          companyName: 'Acme Corp',
          phone: '+1-555-0125',
          lastLogin: '2024-01-13T09:20:00Z',
          createdAt: '2023-10-01T00:00:00Z',
          permissions: ['orders', 'shopping_lists']
        },
        {
          id: 4,
          email: 'sarah.jones@company.com',
          firstName: 'Sarah',
          lastName: 'Jones',
          role: CustomerRole.SENIOR_BUYER,
          status: 'pending',
          companyId: 1,
          companyName: 'Acme Corp',
          phone: '+1-555-0126',
          createdAt: '2024-01-10T00:00:00Z',
          permissions: ['orders', 'quotes']
        },
        {
          id: 5,
          email: 'mike.brown@company.com',
          firstName: 'Mike',
          lastName: 'Brown',
          role: CustomerRole.JUNIOR_BUYER,
          status: 'inactive',
          companyId: 1,
          companyName: 'Acme Corp',
          phone: '+1-555-0127',
          lastLogin: '2023-12-20T14:30:00Z',
          createdAt: '2023-09-15T00:00:00Z',
          permissions: ['orders']
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: CustomerRole) => {
    switch (role) {
      case CustomerRole.ADMIN: return 'Admin';
      case CustomerRole.SENIOR_BUYER: return 'Senior Buyer';
      case CustomerRole.JUNIOR_BUYER: return 'Junior Buyer';
      case CustomerRole.B2C: return 'B2C Customer';
      case CustomerRole.SUPER_ADMIN: return 'Super Admin';
      default: return 'Custom Role';
    }
  };

  const getRoleColor = (role: CustomerRole) => {
    switch (role) {
      case CustomerRole.ADMIN: return 'bg-purple-100 text-purple-800';
      case CustomerRole.SENIOR_BUYER: return 'bg-blue-100 text-blue-800';
      case CustomerRole.JUNIOR_BUYER: return 'bg-green-100 text-green-800';
      case CustomerRole.B2C: return 'bg-gray-100 text-gray-800';
      case CustomerRole.SUPER_ADMIN: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async (userData: Partial<B2BUser>) => {
    try {
      // TODO: Implement with Catalyst client and proper API
      const newUser: B2BUser = {
        id: users.length + 1,
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || CustomerRole.JUNIOR_BUYER,
        status: 'pending',
        companyId: companyId || 1,
        companyName: 'Acme Corp',
        phone: userData.phone || '',
        createdAt: new Date().toISOString(),
        permissions: []
      };
      setUsers([...users, newUser]);
      setShowAddUser(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = async (userData: B2BUser) => {
    try {
      // TODO: Implement with Catalyst client and proper API
      setUsers(users.map(user => user.id === userData.id ? userData : user));
      setShowEditUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      // TODO: Implement with Catalyst client and proper API
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        {canAddUsers && (
          <Button
            onClick={() => setShowAddUser(true)}
            variant="primary"
            size="medium"
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Button>
        )}
      </div>

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
              onChange={(e) => setRoleFilter(e.target.value as CustomerRole | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value={CustomerRole.ADMIN}>Admin</option>
              <option value={CustomerRole.SENIOR_BUYER}>Senior Buyer</option>
              <option value={CustomerRole.JUNIOR_BUYER}>Junior Buyer</option>
              <option value={CustomerRole.B2C}>B2C Customer</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'pending')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
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
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
                        {getStatusIcon(user.status)}
                        <span className={`ml-2 text-sm font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {canEditUsers && (
                          <Button
                            onClick={() => setShowEditUser(user)}
                            variant="ghost"
                            size="small"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDeleteUsers && (
                          <Button
                            onClick={() => setShowDeleteUser(user)}
                            variant="ghost"
                            size="small"
                            className="text-red-600 hover:text-red-900"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
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
          companyId={companyId}
        />
      )}
      {showEditUser && (
        <EditUserModal
          user={showEditUser}
          onClose={() => setShowEditUser(null)}
          onSuccess={handleEditUser}
        />
      )}
      {showDeleteUser && (
        <DeleteUserModal
          user={showDeleteUser}
          onClose={() => setShowDeleteUser(null)}
          onSuccess={() => handleDeleteUser(showDeleteUser.id)}
        />
      )}
    </div>
  );
}

// Add User Modal Component
function AddUserModal({ onClose, onSuccess, companyId }: { 
  onClose: () => void; 
  onSuccess: (userData: Partial<B2BUser>) => void; 
  companyId?: number;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: CustomerRole.JUNIOR_BUYER
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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
                onChange={(e) => setFormData({...formData, role: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={CustomerRole.JUNIOR_BUYER}>Junior Buyer</option>
                <option value={CustomerRole.SENIOR_BUYER}>Senior Buyer</option>
                <option value={CustomerRole.ADMIN}>Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="tertiary"
                size="medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="medium"
              >
                Add User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }: { 
  user: B2BUser; 
  onClose: () => void; 
  onSuccess: (userData: B2BUser) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    status: user.status
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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
                onChange={(e) => setFormData({...formData, role: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={CustomerRole.JUNIOR_BUYER}>Junior Buyer</option>
                <option value={CustomerRole.SENIOR_BUYER}>Senior Buyer</option>
                <option value={CustomerRole.ADMIN}>Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'pending'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="tertiary"
                size="medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="medium"
              >
                Update User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Delete User Modal Component
function DeleteUserModal({ user, onClose, onSuccess }: { 
  user: B2BUser; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const handleDelete = async () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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
              <Button
                onClick={onClose}
                variant="tertiary"
                size="medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                size="medium"
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 