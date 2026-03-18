import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import API_BASE from '../config';

const TOTAL_SLOTS = 32;

const ConfirmList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/registrations`);
        const data = await response.json();
        setEntries(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
    // Auto-refresh every 30s
    const interval = setInterval(fetchRegistrations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Build full 32-slot array
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const entry = entries[i] || null;
    return { num: i + 1, entry };
  });

  return (
    <div className="custom-purple-page">
      <h1 className="custom-title">Player confirm list</h1>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#000' }}>Loading...</div>
      ) : (
        <div className="custom-board">
          <div className="custom-grid">
            {slots.map(({ num, entry }) => (
              <div key={num} className="custom-slot">
                {/* Visual Square Checkbox outline with S1, S2, etc. */}
                <div className="custom-square">
                  S{num}
                </div>

                {/* Main Pill Shape */}
                <div className={`custom-pill ${!entry ? 'empty-pill' : ''}`}>
                  <span className="player-name">
                    {entry ? (entry.inGameName || entry.playerName) : 'AVAILABLE'}
                  </span>

                  {/* Top-right overlapping tag showing Status */}
                  <div className={`custom-tag ${entry ? (entry.status === 'VERIFIED' ? 'tag-verified' : 'tag-pending') : 'tag-empty'}`}>
                    {entry ? entry.status : 'OPEN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmList;
