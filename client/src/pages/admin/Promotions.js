import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaGift,
  FaCalendar,
  FaPercentage
} from 'react-icons/fa';
import './Promotions.css';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'welcome_bonus',
    code: '',
    value: 100,
    valueType: 'percentage',
    minDeposit: 10,
    maxBonus: 500,
    wageringRequirement: 30,
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('/api/admin/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    setFormData({
      name: '',
      description: '',
      type: 'welcome_bonus',
      code: '',
      value: 100,
      valueType: 'percentage',
      minDeposit: 10,
      maxBonus: 500,
      wageringRequirement: 30,
      validFrom: '',
      validUntil: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (promo) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name,
      description: promo.description,
      type: promo.type,
      code: promo.code || '',
      value: promo.value,
      valueType: promo.valueType,
      minDeposit: promo.minDeposit,
      maxBonus: promo.maxBonus,
      wageringRequirement: promo.wageringRequirement,
      validFrom: promo.validFrom?.split('T')[0] || '',
      validUntil: promo.validUntil?.split('T')[0] || '',
      isActive: promo.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    try {
      await axios.delete(`/api/admin/promotions/${promoId}`);
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromotion) {
        await axios.put(`/api/admin/promotions/${editingPromotion._id}`, formData);
      } else {
        await axios.post('/api/admin/promotions', formData);
      }
      setShowModal(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const getPromotionIcon = (type) => {
    switch (type) {
      case 'welcome_bonus':
        return '🎁';
      case 'deposit_bonus':
        return '💰';
      case 'free_spins':
        return '🎰';
      case 'cashback':
        return '💸';
      default:
        return '🎉';
    }
  };

  return (
    <div className="admin-promotions">
      <div className="admin-page-header">
        <h1>Promotions</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaPlus /> Add Promotion
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="promotions-grid">
          {promotions.map((promo) => (
            <div key={promo._id} className={`promotion-card ${promo.isActive ? '' : 'inactive'}`}>
              <div className="promotion-icon">
                {getPromotionIcon(promo.type)}
              </div>
              <div className="promotion-content">
                <h3>{promo.name}</h3>
                <p>{promo.description}</p>
                <div className="promotion-value">
                  {promo.valueType === 'percentage' && (
                    <>{promo.value}% up to ${promo.maxBonus}</>
                  )}
                  {promo.valueType === 'fixed' && (
                    <>${promo.value}</>
                  )}
                  {promo.valueType === 'spins' && (
                    <>{promo.value} Free Spins</>
                  )}
                </div>
                {promo.code && (
                  <div className="promo-code">
                    Code: <strong>{promo.code}</strong>
                  </div>
                )}
                <div className="promotion-meta">
                  <span>Min Deposit: ${promo.minDeposit}</span>
                  <span>Wagering: {promo.wageringRequirement}x</span>
                </div>
                <div className="promotion-dates">
                  <FaCalendar />
                  {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validUntil).toLocaleDateString()}
                </div>
              </div>
              <div className="promotion-actions">
                <button className="action-btn" onClick={() => handleEdit(promo)}>
                  <FaEdit />
                </button>
                <button className="action-btn delete" onClick={() => handleDelete(promo._id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPromotion ? 'Edit Promotion' : 'Add Promotion'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="2"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input"
                    >
                      <option value="welcome_bonus">Welcome Bonus</option>
                      <option value="deposit_bonus">Deposit Bonus</option>
                      <option value="free_spins">Free Spins</option>
                      <option value="cashback">Cashback</option>
                      <option value="loyalty">Loyalty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Promo Code (optional)</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="input"
                      placeholder="WELCOME100"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Value</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Value Type</label>
                    <select
                      value={formData.valueType}
                      onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
                      className="input"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="spins">Spins</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Deposit</label>
                    <input
                      type="number"
                      value={formData.minDeposit}
                      onChange={(e) => setFormData({ ...formData, minDeposit: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Bonus</label>
                    <input
                      type="number"
                      value={formData.maxBonus}
                      onChange={(e) => setFormData({ ...formData, maxBonus: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Wagering (x)</label>
                    <input
                      type="number"
                      value={formData.wageringRequirement}
                      onChange={(e) => setFormData({ ...formData, wageringRequirement: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valid From</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPromotion ? 'Save Changes' : 'Add Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
