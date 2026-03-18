import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaTrophy,
  FaGamepad,
  FaCoins,
  FaChartLine,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put('/api/auth/profile', formData);
      updateUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getVipColor = (level) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    return colors[level % colors.length];
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <FaUser />
              )}
              <button className="avatar-edit-btn">
                <FaCamera />
              </button>
            </div>
            <div className="profile-info">
              <h1>{user?.username}</h1>
              <div className="profile-meta">
                <span className="profile-email">
                  <FaEnvelope /> {user?.email}
                </span>
                {user?.vipLevel > 0 && (
                  <span
                    className="vip-badge"
                    style={{ background: getVipColor(user.vipLevel) }}
                  >
                    VIP {user.vipLevel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!editing ? (
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(true)}
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="profile-actions-group">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      username: user?.username || '',
                      avatar: user?.avatar || ''
                    });
                  }}
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="profile-edit-form animate-fadeIn">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input"
                minLength={3}
                maxLength={30}
              />
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : stats ? (
          <>
            <div className="profile-section">
              <h2>Gaming Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaGamepad />
                  </div>
                  <div className="stat-value">{stats.stats?.gamesPlayed || 0}</div>
                  <div className="stat-label">Games Played</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaTrophy />
                  </div>
                  <div className="stat-value">{stats.stats?.gamesWon || 0}</div>
                  <div className="stat-label">Games Won</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaCoins />
                  </div>
                  <div className="stat-value">
                    ${(stats.financial?.totalWon || 0).toFixed(2)}
                  </div>
                  <div className="stat-label">Total Won</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-value">
                    ${(stats.financial?.netProfit || 0).toFixed(2)}
                  </div>
                  <div className="stat-label">Net Profit</div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Financial Overview</h2>
              <div className="financial-grid">
                <div className="financial-card">
                  <span className="financial-label">Total Deposited</span>
                  <span className="financial-value">
                    ${(stats.financial?.totalDeposits || 0).toFixed(2)}
                  </span>
                </div>

                <div className="financial-card">
                  <span className="financial-label">Total Withdrawn</span>
                  <span className="financial-value">
                    ${(stats.financial?.totalWithdrawals || 0).toFixed(2)}
                  </span>
                </div>

                <div className="financial-card">
                  <span className="financial-label">Total Wagered</span>
                  <span className="financial-value">
                    ${(stats.financial?.totalBets || 0).toFixed(2)}
                  </span>
                </div>

                <div className="financial-card">
                  <span className="financial-label">Win Rate</span>
                  <span className="financial-value">
                    {stats.stats?.gamesPlayed > 0
                      ? ((stats.stats.gamesWon / stats.stats.gamesPlayed) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Account Info */}
        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                <FaCalendar />{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Account Status</span>
              <span className="info-value">
                <span className="status-badge active">Active</span>
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Email Verification</span>
              <span className="info-value">
                {user?.isVerified ? (
                  <span className="status-badge verified">Verified</span>
                ) : (
                  <span className="status-badge pending">Pending</span>
                )}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">VIP Level</span>
              <span className="info-value">{user?.vipLevel || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
