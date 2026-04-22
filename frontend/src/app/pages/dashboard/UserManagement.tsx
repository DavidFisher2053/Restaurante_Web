import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, UserPlus, MoreVertical, CheckCircle, XCircle, Edit, Trash2, X } from 'lucide-react';
import { apiFetch, readApiError } from '@/lib/api';
import React from 'react';

interface UserRow {
  id: number;
  user_name: string;
  user_email: string;
  user_full_name: string | null;
  user_role: number;
  user_state: boolean;
}

interface MeRow {
  id: number;
}

function roleLabel(role: number): string {
  if (role === 1) return 'Admin';
  if (role === 2) return 'Staff';
  if (role === 3) return 'Regular';
  return `Rol ${role}`;
}

function roleFilterMatch(role: number, filterRole: string): boolean {
  if (filterRole === 'all') return true;
  if (filterRole === 'admin') return role === 1;
  if (filterRole === 'staff') return role === 2;
  if (filterRole === 'regular') return role === 3;
  return false;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meId, setMeId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    user_name: '',
    user_email: '',
    user_full_name: '',
    user_password: '',
    user_role: 2,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/users/');
      if (!res.ok) throw new Error(await readApiError(res));
      const data = (await res.json()) as UserRow[];
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch('/auth/users/me');
        if (!res.ok) return;
        const me = (await res.json()) as MeRow;
        setMeId(me.id);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const displayName = user.user_full_name || user.user_name;
      const matchesSearch =
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilterMatch(user.user_role, filterRole);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.user_state) ||
        (filterStatus === 'inactive' && !user.user_state);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      const res = await apiFetch('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      setShowAddModal(false);
      setNewUser({
        user_name: '',
        user_email: '',
        user_full_name: '',
        user_password: '',
        user_role: 2,
      });
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = (user: UserRow) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedUser) return;
    if (meId !== null && selectedUser.id === meId) {
      setError('No puedes desactivar tu propia sesión.');
      setShowConfirmModal(false);
      setSelectedUser(null);
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_state: false }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      setShowConfirmModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al desactivar');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const displayName = user.user_full_name || user.user_name;
                  const initials = displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('');
                  const role = roleLabel(user.user_role);
                  const statusLabel = user.user_state ? 'Active' : 'Inactive';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm uppercase">
                            {initials || user.user_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{displayName}</p>
                            <p className="text-sm text-gray-500">{user.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            role === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : role === 'Staff'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`flex items-center gap-1 text-sm ${
                            user.user_state ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {user.user_state ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">—</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg opacity-40 cursor-not-allowed"
                            title="Edición vía API próximamente"
                            disabled
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeactivate(user)}
                            disabled={!user.user_state}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                            title={!user.user_state ? 'Usuario ya inactivo' : 'Desactivar'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No users found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Add New User
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    required
                    value={newUser.user_name}
                    onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
                    placeholder="jdoe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.user_email}
                    onChange={(e) => setNewUser({ ...newUser, user_email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.user_full_name}
                  onChange={(e) => setNewUser({ ...newUser, user_full_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.user_password}
                  onChange={(e) => setNewUser({ ...newUser, user_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.user_role}
                  onChange={(e) => setNewUser({ ...newUser, user_role: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                >
                  <option value={1}>Admin (Full Access)</option>
                  <option value={2}>Staff (Limited Access)</option>
                  <option value={3}>Regular User (Customer)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md shadow-blue-200 disabled:opacity-50 transition-all"
                >
                  {actionLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate{' '}
              <strong>{selectedUser?.user_full_name || selectedUser?.user_name}</strong>? This sets the account
              inactive.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeactivate()}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Working…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
