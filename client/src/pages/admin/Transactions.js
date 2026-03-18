import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaClock,
  FaArrowDown,
  FaArrowUp
} from 'react-icons/fa';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (txId) => {
    try {
      await axios.put(`/api/admin/transactions/${txId}`, { status: 'completed' });
      fetchTransactions();
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const handleReject = async (txId) => {
    try {
      await axios.put(`/api/admin/transactions/${txId}`, { status: 'failed' });
      fetchTransactions();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <FaArrowDown className="tx-icon deposit" />;
      case 'withdrawal':
        return <FaArrowUp className="tx-icon withdrawal" />;
      default:
        return <FaClock className="tx-icon" />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
                         tx._id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || tx.type === filter || tx.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-transactions">
      <div className="admin-page-header">
        <h1>Transaction Management</h1>
        <div className="admin-page-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
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
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="tx-id">#{tx._id.slice(-8)}</td>
                  <td>{tx.user?.username || 'Unknown'}</td>
                  <td>
                    <div className="tx-type-cell">
                      {getTransactionIcon(tx.type)}
                      <span>{tx.type}</span>
                    </div>
                  </td>
                  <td className={`tx-amount ${tx.type}`}>
                    {tx.amount > 0 ? '+' : ''}
                    ${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td>{tx.paymentMethod}</td>
                  <td>
                    <span className={`tx-status ${tx.status}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td>
                    {tx.status === 'pending' && tx.type === 'withdrawal' && (
                      <div className="tx-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleApprove(tx._id)}
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleReject(tx._id)}
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
