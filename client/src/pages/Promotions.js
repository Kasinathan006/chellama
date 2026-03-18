import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaGift,
  FaPercentage,
  FaCoins,
  FaClock,
  FaCheckCircle,
  FaCopy
} from 'react-icons/fa';
import './Promotions.css';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      // This would fetch from /api/promotions endpoint
      // For now using mock data
      setPromotions([
        {
          _id: '1',
          name: 'Welcome Bonus',
          description: 'Get a 100% bonus on your first deposit up to $500!',
          type: 'welcome_bonus',
          value: 100,
          valueType: 'percentage',
          maxBonus: 500,
          code: 'WELCOME100',
          validUntil: '2026-12-31'
        },
        {
          _id: '2',
          name: 'Daily Cashback',
          description: 'Get 10% cashback on your losses every day!',
          type: 'cashback',
          value: 10,
          valueType: 'percentage',
          validUntil: '2026-12-31'
        },
        {
          _id: '3',
          name: 'Free Spins Friday',
          description: 'Get 50 free spins every Friday!',
          type: 'free_spins',
          value: 50,
          valueType: 'spins',
          code: 'FRIDAY50',
          validUntil: '2026-12-31'
        }
      ]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="promotions-page">
      <div className="promotions-hero">
        <div className="container">
          <FaGift className="hero-icon" />
          <h1>Promotions & Bonuses</h1>
          <p>Exclusive offers and rewards for our players</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="promotions-grid">
            {promotions.map((promo) => (
              <div key={promo._id} className="promo-card-large">
                <div className="promo-card-header">
                  <div className="promo-icon">
                    {promo.type === 'welcome_bonus' && '🎁'}
                    {promo.type === 'cashback' && '💰'}
                    {promo.type === 'free_spins' && '🎰'}
                  </div>
                  <div className="promo-value-badge">
                    {promo.valueType === 'percentage' && (
                      <>{promo.value}%</>
                    )}
                    {promo.valueType === 'spins' && (
                      <>{promo.value} Spins</>
                    )}
                  </div>
                </div>

                <div className="promo-card-content">
                  <h2>{promo.name}</h2>
                  <p>{promo.description}</p>

                  {promo.code && (
                    <div className="promo-code-box">
                      <span>Code: <strong>{promo.code}</strong></span>
                      <button onClick={() => copyCode(promo.code)}>
                        <FaCopy /> Copy
                      </button>
                    </div>
                  )}

                  <div className="promo-details">
                    {promo.maxBonus && (
                      <div className="promo-detail">
                        <FaCoins />
                        <span>Max Bonus: ${promo.maxBonus}</span>
                      </div>
                    )}
                    <div className="promo-detail">
                      <FaClock />
                      <span>Valid until: {new Date(promo.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-lg">
                    <FaCheckCircle /> Claim Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
