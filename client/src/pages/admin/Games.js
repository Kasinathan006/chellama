import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaFire,
  FaClock
} from 'react-icons/fa';
import './Games.css';

const AdminGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'slots',
    provider: '',
    thumbnail: '',
    rtp: 96,
    volatility: 'medium',
    minBet: 0.10,
    maxBet: 1000,
    isActive: true,
    isFeatured: false,
    isNew: false,
    isPopular: false
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/admin/games');
      setGames(response.data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGame(null);
    setFormData({
      name: '',
      description: '',
      category: 'slots',
      provider: '',
      thumbnail: '',
      rtp: 96,
      volatility: 'medium',
      minBet: 0.10,
      maxBet: 1000,
      isActive: true,
      isFeatured: false,
      isNew: false,
      isPopular: false
    });
    setShowModal(true);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description,
      category: game.category,
      provider: game.provider,
      thumbnail: game.thumbnail,
      rtp: game.rtp,
      volatility: game.volatility,
      minBet: game.minBet,
      maxBet: game.maxBet,
      isActive: game.isActive,
      isFeatured: game.isFeatured,
      isNew: game.isNew,
      isPopular: game.isPopular
    });
    setShowModal(true);
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    try {
      await axios.delete(`/api/admin/games/${gameId}`);
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGame) {
        await axios.put(`/api/admin/games/${editingGame._id}`, formData);
      } else {
        await axios.post('/api/admin/games', formData);
      }
      setShowModal(false);
      fetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const handleToggleStatus = async (gameId, currentStatus) => {
    try {
      await axios.put(`/api/admin/games/${gameId}`, {
        isActive: !currentStatus
      });
      fetchGames();
    } catch (error) {
      console.error('Error updating game status:', error);
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(search.toLowerCase()) ||
    game.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-games">
      <div className="admin-page-header">
        <h1>Game Management</h1>
        <div className="admin-page-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FaPlus /> Add Game
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="admin-games-grid">
          {filteredGames.map((game) => (
            <div key={game._id} className="admin-game-card">
              <div className="game-card-image">
                <img src={game.thumbnail || '/game-placeholder.jpg'} alt={game.name} />
                <div className="game-card-badges">
                  {game.isNew && <span className="badge new"><FaClock /> New</span>}
                  {game.isPopular && <span className="badge popular"><FaFire /> Hot</span>}
                  {game.isFeatured && <span className="badge featured"><FaStar /> Featured</span>}
                </div>
              </div>

              <div className="game-card-content">
                <h3>{game.name}</h3>
                <p className="game-provider">{game.provider}</p>

                <div className="game-stats">
                  <span>RTP: {game.rtp}%</span>
                  <span>{game.playCount?.toLocaleString()} plays</span>
                </div>

                <div className="game-card-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleEdit(game)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={`action-btn ${game.isActive ? '' : 'inactive'}`}
                    onClick={() => handleToggleStatus(game._id, game.isActive)}
                    title={game.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {game.isActive ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(game._id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content game-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGame ? 'Edit Game' : 'Add New Game'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Game Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Provider</label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                    >
                      <option value="slots">Slots</option>
                      <option value="table">Table Games</option>
                      <option value="card">Card Games</option>
                      <option value="arcade">Arcade</option>
                      <option value="live">Live Casino</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Volatility</label>
                    <select
                      value={formData.volatility}
                      onChange={(e) => setFormData({ ...formData, volatility: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>RTP (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.rtp}
                      onChange={(e) => setFormData({ ...formData, rtp: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Bet</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minBet}
                      onChange={(e) => setFormData({ ...formData, minBet: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Bet</label>
                    <input
                      type="number"
                      value={formData.maxBet}
                      onChange={(e) => setFormData({ ...formData, maxBet: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Featured
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    New
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    />
                    Popular
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGame ? 'Save Changes' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGames;
