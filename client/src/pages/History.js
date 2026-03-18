import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaGamepad,
  FaCalendar,
  FaFilter,
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt
} from 'react-icons/fa';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/users/history');
      setHistory(response.data.transactions);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <FaArrowDown className="history-icon deposit" />;
      case 'withdrawal':
        return <FaArrowUp className="history-icon withdrawal" />;
      case 'bet':
        return <FaGamepad className="history-icon bet" />;
      case 'win':
        return <FaExchangeAlt className="history-icon win" />;
      default:
        return <FaExchangeAlt className="history-icon" />;
    }
  };

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header">
          <h1>Game History</h1>
          <div className="filter-tabs">
            {['all', 'bet', 'win', 'deposit', 'withdrawal'].map((type) => (
              <button
                key={type}
                className={filter === type ? 'active' : ''}
                onClick={() => setFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div key={item._id} className="history-item">
                  <div className="history-icon-wrapper">
                    {getIcon(item.type)}
                  </div>
                  <div className="history-info">
                    <div className="history-type">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                    {item.game && (
                      <div className="history-game">{item.game.name}</div>
                    )}
                    <div className="history-date">
                      <FaCalendar />{' '}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`history-amount ${item.type}`}>
                    {item.amount > 0 ? '+' : ''}
                    ${Math.abs(item.amount).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaGamepad className="empty-state-icon" />
                <h3>No history yet</h3>
                <p>Start playing to see your game history here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
