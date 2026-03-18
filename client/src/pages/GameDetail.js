import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaArrowLeft, FaTrophy, FaSkull, FaUserAlt, FaUsers, FaClock } from 'react-icons/fa';
import './GameDetail.css';

const fallbackGames = {
  'tour-1': {
    _id: 'tour-1',
    name: 'Chellama Crown Clash',
    provider: 'Chellama Arena',
    mode: 'tournament',
    description: 'Knockout tournament ladder with prize pool finals.',
    thumbnail: '/assets/images/reference-1.jpg',
    banner: '/assets/images/reference-1.jpg',
    minBet: 5,
    maxBet: 200,
    rtp: 97.5,
    rating: 4.8,
    playCount: 12034
  },
  'br-1': {
    _id: 'br-1',
    name: 'Storm Circle BR',
    provider: 'Chellama Arena',
    mode: 'battle-royale',
    description: 'Last-player-standing BR with dynamic zone pressure.',
    thumbnail: '/assets/images/reference-2.jpg',
    banner: '/assets/images/reference-2.jpg',
    minBet: 2,
    maxBet: 100,
    rtp: 96.2,
    rating: 4.7,
    playCount: 23550
  },
  'solo-1': {
    _id: 'solo-1',
    name: 'Solo Face-Off X',
    provider: 'Chellama Arena',
    mode: 'solo-match',
    description: 'Skill-based 1v1 fast queue with instant matchmaking.',
    thumbnail: '/assets/images/reference-3.jpg',
    banner: '/assets/images/reference-3.jpg',
    minBet: 1,
    maxBet: 50,
    rtp: 95.9,
    rating: 4.6,
    playCount: 18022
  }
};

const modeMeta = {
  tournament: {
    icon: FaTrophy,
    title: 'Tournament Rules',
    points: ['Elimination bracket format', 'Top 3 get prize split', 'Late entry closes in 10 min']
  },
  'battle-royale': {
    icon: FaSkull,
    title: 'Battle Royale Rules',
    points: ['40 players per lobby', 'Shrinking safe zone every round', 'Top 5 receive leaderboard points']
  },
  'solo-match': {
    icon: FaUserAlt,
    title: 'Solo Match Rules',
    points: ['Instant 1v1 queue', 'Best of three rounds', 'Win streak bonus rewards']
  }
};

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [betAmount, setBetAmount] = useState(1);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/games/${id}`);
        const remote = response.data;
        const hydrated = {
          ...remote,
          mode: remote.mode || inferMode(remote.name || ''),
          banner: remote.banner || remote.thumbnail,
          minBet: remote.minBet || 1,
          maxBet: remote.maxBet || 100
        };
        setGame(hydrated);
        setBetAmount(hydrated.minBet);
      } catch (error) {
        const fallback = fallbackGames[id] || fallbackGames['tour-1'];
        setGame(fallback);
        setBetAmount(fallback.minBet);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  const handlePlay = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowPlayModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const meta = modeMeta[game.mode] || modeMeta['solo-match'];
  const ModeIcon = meta.icon;

  return (
    <div className="game-detail-page">
      <div className="game-hero">
        <div className="game-hero-bg" style={{ backgroundImage: `url(${game.banner || game.thumbnail})` }} />
        <div className="container">
          <button onClick={() => navigate('/games')} className="back-btn">
            <FaArrowLeft /> Back to Games
          </button>
          <div className="game-hero-content">
            <div className="game-hero-info">
              <span className="game-mode-chip"><ModeIcon /> {formatMode(game.mode)}</span>
              <h1>{game.name}</h1>
              <p className="game-provider">By {game.provider}</p>
              <p className="game-description">{game.description}</p>
              <div className="game-actions">
                <button className="btn btn-primary btn-lg" onClick={handlePlay}>
                  <FaPlay /> Play Now
                </button>
              </div>
            </div>
            <div className="game-hero-image">
              <img src={game.thumbnail} alt={game.name} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="game-info-grid">
          <div className="info-section">
            <h2>{meta.title}</h2>
            <ul className="how-to-play">
              {meta.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="sidebar-card">
            <h3>Quick Stats</h3>
            <div className="quick-stat">
              <FaUsers />
              <div>
                <span className="stat-label">Players Joined</span>
                <span className="stat-value">{Number(game.playCount || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="quick-stat">
              <FaClock />
              <div>
                <span className="stat-label">Avg Session</span>
                <span className="stat-value">18 min</span>
              </div>
            </div>
            <div className="quick-stat">
              <FaTrophy />
              <div>
                <span className="stat-label">Best Reward</span>
                <span className="stat-value">$10,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPlayModal && (
        <div className="modal-overlay" onClick={() => setShowPlayModal(false)}>
          <div className="modal-content game-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enter {formatMode(game.mode)}</h3>
              <button className="modal-close" onClick={() => setShowPlayModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="bet-amount-section">
                <label>Entry Amount</label>
                <div className="bet-amount-controls">
                  <button
                    onClick={() => setBetAmount(Math.max(game.minBet, betAmount - 1))}
                    className="btn btn-secondary"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={betAmount}
                    min={game.minBet}
                    max={game.maxBet}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="input"
                  />
                  <button
                    onClick={() => setBetAmount(Math.min(game.maxBet, betAmount + 1))}
                    className="btn btn-secondary"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="balance-info">Wallet Balance: ${user?.wallet?.balance?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPlayModal(false)}>Cancel</button>
              <button className="btn btn-primary">Confirm Join</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatMode(mode) {
  if (mode === 'battle-royale') return 'Battle Royale';
  if (mode === 'tournament') return 'Tournament';
  return 'Solo Match';
}

function inferMode(text) {
  const lower = text.toLowerCase();
  if (lower.includes('battle') || lower.includes('royale')) return 'battle-royale';
  if (lower.includes('tournament') || lower.includes('cup')) return 'tournament';
  return 'solo-match';
}

export default GameDetail;
