import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import API_BASE from '../config';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    playerName: '',
    inGameName: '',
    gameUid: '',
    contact: '',
    mode: 'Solo Match'
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!screenshot) {
      setSuccess('❌ Please upload a payment screenshot to proceed.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('playerName', form.playerName);
      formData.append('inGameName', form.inGameName);
      formData.append('gameUid', form.gameUid);
      formData.append('contact', form.contact);
      formData.append('mode', form.mode);
      formData.append('region', 'Asia / South');
      formData.append('status', 'WAITING LIST');
      formData.append('screenshot', screenshot);

      const response = await fetch(`${API_BASE}/api/registrations`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSuccess('✅ Registration submitted! Redirecting to roster...');
        setForm({ playerName: '', inGameName: '', gameUid: '', contact: '', mode: 'Solo Match' });
        setScreenshot(null);
        setTimeout(() => navigate('/registered'), 1500);
      } else {
        setSuccess('❌ Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSuccess('❌ Server error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-stars"></div>

      <div className="reg-wrapper">
        <div className="reg-title-block">
          <h1>JOIN TOURNAMENT</h1>
          <p>SOLO MATCH · ENTRY ₹10 · PRIZE ₹180</p>
        </div>

        <div className="reg-grid">

          {/* LEFT: Registration Form */}
          <div className="reg-form-card">
            <div className="reg-card-label">PLAYER DETAILS</div>

            {success && <div className={`reg-alert ${success.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{success}</div>}

            <form onSubmit={onSubmit} className="reg-form">
              <div className="reg-field">
                <label>PLAYER NAME</label>
                <input
                  className="reg-input"
                  name="playerName"
                  placeholder="Enter your name"
                  value={form.playerName}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="reg-field">
                <label>IN-GAME NAME</label>
                <input
                  className="reg-input"
                  name="inGameName"
                  placeholder="Your Free Fire name"
                  value={form.inGameName}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="reg-field">
                <label>GAME UID</label>
                <input
                  className="reg-input"
                  name="gameUid"
                  placeholder="Numeric UID (e.g. 123456789)"
                  value={form.gameUid}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="reg-field">
                <label>CONTACT / WHATSAPP</label>
                <input
                  className="reg-input"
                  name="contact"
                  placeholder="+91 XXXXXXXXXX"
                  value={form.contact}
                  onChange={onChange}
                  required
                />
              </div>

              <button className="reg-submit-btn" type="submit" disabled={loading}>
                {loading ? 'SUBMITTING...' : 'REGISTER NOW'}
              </button>
            </form>
          </div>

          {/* RIGHT: Payment / QR */}
          <div className="reg-qr-card">
            <div className="reg-card-label">PAYMENT</div>

            <div className="qr-amount-badge">₹10</div>
            <p className="qr-instruction">Scan QR & pay entry fee</p>

            <div className="qr-box">
              <img
                src="/assets/qr.jpg"
                alt="Payment QR"
                className="qr-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  document.getElementById('qr-placeholder').style.display = 'flex';
                }}
              />
              <div id="qr-placeholder" className="qr-placeholder" style={{ display: 'none' }}>
                <span>QR CODE</span>
                <small>Add your UPI QR at /assets/qr.jpg</small>
              </div>
            </div>

            <div className="ss-upload-section">
              <label className="ss-label">📸 Upload Payment Screenshot</label>
              <label className="ss-upload-btn">
                {screenshot ? `✅ ${screenshot.name}` : 'Choose Screenshot'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
              </label>
            </div>

            <div className="payment-note">
              <p>⚠️ Registration only confirmed after payment screenshot is verified.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
