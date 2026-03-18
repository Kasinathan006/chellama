import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUsers,
  FaGamepad,
  FaExchangeAlt,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaClock
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
      setRecentTransactions(response.data.recentTransactions);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: color }}>
        <Icon />
      </div>
      <div className="admin-stat-content">
        <span className="admin-stat-title">{title}</span>
        <span className="admin-stat-value">{value}</span>
        {trend && (
          <span className={`admin-stat-trend ${trend.type}`}>
            {trend.type === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 35000],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(124, 58, 237, 0.1)',
        },
        ticks: {
          color: '#8b5cf6',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8b5cf6',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <span className="admin-date">
          <FaClock /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={FaUsers}
          color="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
          trend={{ type: 'up', value: 12 }}
        />
        <StatCard
          title="Active Games"
          value={stats?.activeGames?.toLocaleString() || '0'}
          icon={FaGamepad}
          color="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
          trend={{ type: 'up', value: 5 }}
        />
        <StatCard
          title="Today's Deposits"
          value={`$${(stats?.todayDeposits || 0).toFixed(2)}`}
          icon={FaArrowDown}
          color="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
          trend={{ type: 'up', value: 23 }}
        />
        <StatCard
          title="Today's Withdrawals"
          value={`$${(stats?.todayWithdrawals || 0).toFixed(2)}`}
          icon={FaArrowUp}
          color="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
          trend={{ type: 'down', value: 8 }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={FaDollarSign}
          color="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
          trend={{ type: 'up', value: 18 }}
        />
        <StatCard
          title="Pending Withdrawals"
          value={stats?.pendingWithdrawals?.toString() || '0'}
          icon={FaClock}
          color="linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
        />
      </div>

      {/* Charts Row */}
      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="admin-chart-card small">
          <h3>Game Categories</h3>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: ['Slots', 'Table', 'Card', 'Arcade', 'Live', 'Sports'],
                datasets: [{
                  data: [45, 20, 15, 10, 7, 3],
                  backgroundColor: [
                    '#7c3aed',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#ec4899',
                  ],
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#8b5cf6',
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-activity-row">
        <div className="admin-activity-card">
          <div className="activity-header">
            <h3>Recent Users</h3>
            <a href="/admin/users" className="view-all">View All</a>
          </div>
          <div className="activity-list">
            {recentUsers.map((user) => (
              <div key={user._id} className="activity-item">
                <div className="activity-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="activity-info">
                  <span className="activity-name">{user.username}</span>
                  <span className="activity-email">{user.email}</span>
                </div>
                <div className="activity-meta">
                  <span className="activity-balance">
                    ${user.wallet?.balance?.toFixed(2) || '0.00'}
                  </span>
                  <span className="activity-time">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-activity-card">
          <div className="activity-header">
            <h3>Recent Transactions</h3>
            <a href="/admin/transactions" className="view-all">View All</a>
          </div>
          <div className="activity-list">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="activity-item">
                <div className={`activity-icon ${tx.type}`}>
                  <FaExchangeAlt />
                </div>
                <div className="activity-info">
                  <span className="activity-name">
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </span>
                  <span className="activity-email">{tx.user?.username}</span>
                </div>
                <div className="activity-meta">
                  <span className={`activity-amount ${tx.type}`}>
                    {tx.amount > 0 ? '+' : ''}
                    ${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className={`activity-status ${tx.status}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
