import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaSearch, FaFilter, FaTrophy, FaSkull, FaUserAlt } from 'react-icons/fa';
import './Games.css';

const fallbackGames = [
  {
    _id: 'tour-1',
    name: 'Chellama Crown Clash',
    provider: 'Chellama Arena',
    category: 'esports',
    mode: 'tournament',
    rtp: 97.5,
    rating: 4.8,
    thumbnail: '/assets/images/reference-1.jpg',
    description: 'Weekly knockout ladder with seeded bracket finals.',
    isFeatured: true,
    isPopular: true
  },
  {
    _id: 'br-1',
    name: 'Storm Circle BR',
    provider: 'Chellama Arena',
    category: 'battle',
    mode: 'battle-royale',
    rtp: 96.2,
    rating: 4.7,
    thumbnail: '/assets/images/reference-2.jpg',
    description: '40-player last survivor mode with shrinking zone.',
    isPopular: true
  },
  {
    _id: 'solo-1',
    name: 'Solo Face-Off X',
    provider: 'Chellama Arena',
    category: 'solo',
    mode: 'solo-match',
    rtp: 95.9,
    rating: 4.6,
    thumbnail: '/assets/images/reference-3.jpg',
    description: 'Fast 1v1 ranked queue with instant rematch.',
    isNew: true
  }
];

const modeConfig = [
  { id: 'all', label: 'All Modes', icon: FaFilter },
  { id: 'tournament', label: 'Tournament', icon: FaTrophy },
  { id: 'battle-royale', label: 'Battle Royale', icon: FaSkull },
  { id: 'solo-match', label: 'Solo Match', icon: FaUserAlt }
];

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    mode: searchParams.get('mode') || 'all',
    search: '',
  });

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/games?limit=100');
        const remoteGames = response.data?.games || [];
        setGames(
          remoteGames.map((game) => ({
            ...game,
            mode: game.mode || guessMode(game),
            thumbnail: game.thumbnail || '/assets/images/reference-1.jpg'
          }))
        );
      } catch (error) {
        setGames(fallbackGames);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const modeMatch = filters.mode === 'all' ? true : game.mode === filters.mode;
      const searchText = `${game.name} ${game.provider} ${game.description || ''}`.toLowerCase();
      const searchMatch = filters.search.trim()
        ? searchText.includes(filters.search.toLowerCase())
        : true;
      return modeMatch && searchMatch;
    });
  }, [games, filters.mode, filters.search]);

  const handleMode = (mode) => {
    setFilters((prev) => ({ ...prev, mode }));
    setSearchParams(mode === 'all' ? {} : { mode });
  };

  return (
    <div className="games-page">
      <section className="games-header">
        <div className="container">
          <h1>Chellama Match Lobby</h1>
          <p>Pick your mode and queue instantly.</p>
          <div className="games-search">
            <FaSearch className="games-search-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search tournament / BR / solo..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="games-mode-strip">
        <div className="container games-mode-row">
          {modeConfig.map((mode) => (
            <button
              key={mode.id}
              className={`games-mode-btn ${filters.mode === mode.id ? 'active' : ''}`}
              onClick={() => handleMode(mode.id)}
            >
              <mode.icon />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="games-content container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="empty-state">
            <h3>No games found</h3>
            <p>Try another mode or keyword.</p>
          </div>
        ) : (
          <div className="games-grid">
            {filteredGames.map((game) => (
              <Link key={game._id} to={`/games/${game._id}`} className="game-card">
                <div className="game-card-image">
                  <img src={game.thumbnail} alt={game.name} />
                  <div className="game-card-overlay">
                    <span><FaPlay /> Enter Match</span>
                  </div>
                  <span className="game-mode-pill">{formatMode(game.mode)}</span>
                </div>
                <div className="game-card-content">
                  <h3>{game.name}</h3>
                  <p>{game.provider}</p>
                  <div className="game-card-meta">
                    <span>RTP {game.rtp}%</span>
                    <span>{Number(game.rating || 4.5).toFixed(1)}★</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

function formatMode(mode) {
  if (mode === 'battle-royale') return 'Battle Royale';
  if (mode === 'solo-match') return 'Solo Match';
  if (mode === 'tournament') return 'Tournament';
  return 'Arcade';
}

function guessMode(game) {
  const text = `${game.name || ''} ${game.category || ''}`.toLowerCase();
  if (text.includes('battle') || text.includes('royale')) return 'battle-royale';
  if (text.includes('solo') || text.includes('1v1')) return 'solo-match';
  if (text.includes('tournament') || text.includes('cup')) return 'tournament';
  return 'solo-match';
}

export default Games;
