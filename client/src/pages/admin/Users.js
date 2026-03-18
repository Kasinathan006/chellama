import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaBan,
  FaCheck,
  FaUser,
  FaWallet,
  FaGamepad,
  FaArrowLeft,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    role: '',
    isActive: true,
    wallet: { balance: 0, bonus: 0 },
    vipLevel: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      isActive: user.isActive,
      wallet: { ...user.wallet },
      vipLevel: user.vipLevel
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}`, editForm);
      fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, {
        isActive: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
                           (filter === 'active' && user.isActive) ||
                           (filter === 'inactive' && !user.isActive) ||
                           (filter === 'admin' && user.role === 'admin');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-users">
      <div className="admin-page-header">
        <h1>User Management</h1>
        <div className="admin-page-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Balance</th>
                <th>VIP</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.username}</span>
                        <span className="user-id">#{user._id.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="balance-cell">
                      <span>${user.wallet?.balance?.toFixed(2) || '0.00'}</span>
                      {user.wallet?.bonus > 0 && (
                        <span className="bonus">+${user.wallet.bonus.toFixed(2)} bonus</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="vip-badge">
                      Level {user.vipLevel || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`action-btn ${user.isActive ? 'ban' : 'unban'}`}
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <FaBan /> : <FaCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={selectedUser.username}
                  disabled
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Balance</label>
                <input
                  type="number"
                  value={editForm.wallet.balance}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    wallet: { ...editForm.wallet, balance: parseFloat(e.target.value) }
                  })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Bonus</label>
                <input
                  type="number"
                  value={editForm.wallet.bonus}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    wallet: { ...editForm.wallet, bonus: parseFloat(e.target.value) }
                  })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>VIP Level</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={editForm.vipLevel}
                  onChange={(e) => setEditForm({ ...editForm, vipLevel: parseInt(e.target.value) })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
