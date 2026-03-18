import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDiscord, FaYoutube, FaInstagram } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="home-container">

      {/* Starfield dots */}
      <div className="stars-layer"></div>

      {/* TOP TITLE */}
      <div className="home-header">
        <h1>CHELLAMA GAMING</h1>
        <p className="subtitle">SOLO BATTLE ROYAL</p>
      </div>

      {/* THREE COLUMN LAYOUT */}
      <div className="home-content">

        {/* LEFT COLUMN: Prize Pool */}
        <div className="left-col">
          <p className="prize-title">TOTAL PRIZE POOL</p>
          <div className="total-prize-wrapper">
            <h2 className="total-prize"><span className="cyan-text">₹</span>180</h2>
          </div>
          <div className="prize-divider"></div>

          <div className="prize-list">
            <div className="prize-item">
              <span className="prize-rank">1<span className="sup cyan-text">ST</span> PRIZE</span>
              <span className="prize-dash">-</span>
              <span className="prize-amount first-prize-amount"><span className="cyan-text">₹</span>100</span>
            </div>
            <div className="prize-item">
              <span className="prize-rank">2<span className="sup cyan-text">ND</span> PRIZE</span>
              <span className="prize-dash">-</span>
              <span className="prize-amount"><span className="cyan-text">₹</span>80</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Character, Branding, Enter Button */}
        <div className="center-col">
          <div className="scanlines-bg"></div>
          <div className="center-glow"></div>
          {/* Removed watermark */}

          <img
            src="/assets/character.png"
            alt="Chellama Gaming"
            className="character-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="enter-btn-wrapper">
            <button
              className="enter-btn"
              onClick={() => navigate('/register')}
            >
              ENTER TOURNAMENT
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Entry & Map Details */}
        <div className="right-col">
          <div className="entry-box neon-box">
            <h3 className="entry-price cyan-text"><span>₹</span>10</h3>
            <p className="entry-label">ENTRY</p>
          </div>

          <div className="map-box neon-box">
            <img
              src="/assets/map.jpg"
              alt="Tournament Poster"
              className="map-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="map-info">
            <p className="map-detail-text">MODE: <span className="cyan-text">BR ( E-SPORTS MODE )</span></p>
            <p className="map-detail-text">MAP: <span className="cyan-text">BERMUDA</span></p>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="footer-row">
        <div className="socials-box">
          <a href="https://discord.com/invite/MANw5zuBgU" target="_blank" rel="noreferrer" className="social-btn discord-btn">
            <FaDiscord size={18} /> DISCORD
          </a>
          <a href="https://youtube.com/@chellamma_gaming?si=1JIMS7Sh9dXJfKvH" target="_blank" rel="noreferrer" className="social-btn youtube-btn">
            <FaYoutube size={18} /> YOUTUBE
          </a>
          <a href="https://www.instagram.com/chellamma_gaming?igsh=dDBodXk2amQwa2E1" target="_blank" rel="noreferrer" className="social-btn instagram-btn">
            <FaInstagram size={18} /> INSTAGRAM
          </a>
        </div>

        <div className="footer-action-buttons">
          <button
            className="rules-btn"
            onClick={() => setShowRules(true)}
          >
            RULES
          </button>
          <button
            className="rules-btn disclaimer-btn"
            onClick={() => setShowDisclaimer(true)}
          >
            DISCLAIMER
          </button>
        </div>
      </div>

      {/* RULES MODAL */}
      {
        showRules && (
          <div className="disclaimer-modal-overlay" onClick={() => setShowRules(false)}>
            <div className="disclaimer-box" onClick={(e) => e.stopPropagation()}>

              <button className="close-modal-btn" onClick={() => setShowRules(false)}>✕</button>

              <h3>Chellama Gaming – Rules</h3>

              <div className="disclaimer-grid">
                <div>
                  <h4>📋 Requirements:</h4>
                  <ul>
                    <li>Minimum level required: 20</li>
                    <li><strong>Gameplay recording is compulsory</strong><br />Your match gameplay must be recorded for verification. Failure to provide recording → Disqualification</li>
                  </ul>
                </div>
                <div>
                  <h4>🎮 Gameplay:</h4>
                  <ul>
                    <li>Solo gameplay only (No Teaming up)</li>
                    <li>No spectators allowed</li>
                  </ul>
                </div>
                <div>
                  <h4>🚨 Cheats / Panel:</h4>
                  <ul>
                    <li>Hack / panel → Direct Disqualification</li>
                    <li>If suspected, must join Discord within 15 mins.<br />Failure to join or show proof → Disqualification</li>
                  </ul>
                </div>
                <div>
                  <h4>💳 Entry & Payment:</h4>
                  <ul>
                    <li>Entry fee must be paid before match confirmation</li>
                    <li>No refunds after payment</li>
                  </ul>
                </div>
                <div>
                  <h4>❌ Disqualification:</h4>
                  <ul>
                    <li>Rule violation → Immediate Disqualification</li>
                    <li>Disqualified players will not receive rewards</li>
                    <li>Prize goes to next eligible player</li>
                  </ul>
                </div>
                <div>
                  <h4>⚠️ Other Conditions:</h4>
                  <ul>
                    <li>Not responsible for internet / device / technical issues</li>
                    <li>By joining, you agree to follow all rules</li>
                    <li>Admins decision is final</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )
      }

      {/* DISCLAIMER MODAL */}
      {
        showDisclaimer && (
          <div className="disclaimer-modal-overlay" onClick={() => setShowDisclaimer(false)}>
            <div className="disclaimer-box" onClick={(e) => e.stopPropagation()}>

              <button className="close-modal-btn" onClick={() => setShowDisclaimer(false)}>✕</button>

              <h3>Welcome to Chellama Gaming 💖🎮</h3>
              <p className="disclaimer-intro">All matches conducted on this channel are solo Free Fire battles, purely skill-based gameplay created for entertainment and competitive purposes.</p>

              <div className="disclaimer-grid">
                <div>
                  <h4>🚫 We strictly do not support or promote:</h4>
                  <ul>
                    <li>Gambling</li>
                    <li>Betting</li>
                    <li>Money cheating</li>
                    <li>Financial fraud</li>
                    <li>Any illegal activities</li>
                  </ul>
                </div>
                <div>
                  <h4>💰 Any entry fees, if applicable, are used only for:</h4>
                  <ul>
                    <li>Match organization</li>
                    <li>Declared reward distribution</li>
                  </ul>
                </div>
                <div>
                  <h4>⚠️ We do not guarantee:</h4>
                  <ul>
                    <li>Profit</li>
                    <li>Income</li>
                    <li>Financial returns</li>
                  </ul>
                </div>
                <div>
                  <h4>✅ Participants must:</h4>
                  <ul>
                    <li>Provide accurate information</li>
                    <li>Follow fair play rules</li>
                  </ul>
                </div>
                <div>
                  <h4>❌ Any violation such as:</h4>
                  <ul>
                    <li>Fake payments</li>
                    <li>Chargebacks</li>
                    <li>Hacking / cheats</li>
                    <li>Use of unauthorized software</li>
                    <li>Unfair gameplay</li>
                  </ul>
                  <p className="disclaimer-alert">➡️ Will result in immediate disqualification and possible ban.</p>
                </div>
                <div>
                  <h4>🔌 We are not responsible for:</h4>
                  <ul>
                    <li>Internet issues</li>
                    <li>Device malfunctions</li>
                    <li>Server problems</li>
                    <li>Power failures</li>
                    <li>Technical errors beyond our control</li>
                  </ul>
                </div>
              </div>

              <p className="disclaimer-note">All game names, logos, and trademarks belong to their respective owners.<br />This channel is not affiliated with or sponsored by any official game developer or publisher.</p>

              <div className="disclaimer-management">
                <h4>⚖️ Management reserves the right to:</h4>
                <p>Modify rules • Cancel matches • Take necessary actions to ensure fairness, transparency, and security</p>
              </div>

              <div className="disclaimer-final">
                <h4>✨ Final Note</h4>
                <p>By participating, you agree to respect the rules, maintain fair play, and support a positive gaming community.</p>
                <p><strong>Play fair, stay respectful, and enjoy the game with Chellama Gaming 💖🎮</strong></p>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default Home;
