import React, { useState } from 'react';
import {
  FaSave,
  FaBell,
  FaLock,
  FaGlobe,
  FaCreditCard,
  FaEnvelope
} from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'PurplePlay',
    siteDescription: 'Premium Gaming Platform',
    maintenanceMode: false,
    registrationEnabled: true,
    minDeposit: 10,
    maxDeposit: 10000,
    minWithdrawal: 20,
    maxWithdrawal: 5000,
    withdrawalFee: 0,
    supportEmail: 'support@purpleplay.com',
    discordLink: '',
    twitterLink: '',
    telegramLink: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaGlobe },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaLock },
  ];

  return (
    <div className="admin-settings">
      <div className="admin-page-header">
        <h1>Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>

              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  className="input"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Support Email</label>
                <div className="input-with-icon">
                  <FaEnvelope />
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Social Links</label>
                <input
                  type="text"
                  name="discordLink"
                  value={settings.discordLink}
                  onChange={handleChange}
                  className="input"
                  placeholder="Discord invite link"
                />
                <input
                  type="text"
                  name="twitterLink"
                  value={settings.twitterLink}
                  onChange={handleChange}
                  className="input"
                  placeholder="Twitter profile link"
                  style={{ marginTop: '8px' }}
                />
                <input
                  type="text"
                  name="telegramLink"
                  value={settings.telegramLink}
                  onChange={handleChange}
                  className="input"
                  placeholder="Telegram channel link"
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  Maintenance Mode
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="registrationEnabled"
                    checked={settings.registrationEnabled}
                    onChange={handleChange}
                  />
                  Enable User Registration
                </label>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="settings-section">
              <h2>Payment Settings</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Deposit ($)</label>
                  <input
                    type="number"
                    name="minDeposit"
                    value={settings.minDeposit}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Deposit ($)</label>
                  <input
                    type="number"
                    name="maxDeposit"
                    value={settings.maxDeposit}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Withdrawal ($)</label>
                  <input
                    type="number"
                    name="minWithdrawal"
                    value={settings.minWithdrawal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Withdrawal ($)</label>
                  <input
                    type="number"
                    name="maxWithdrawal"
                    value={settings.maxWithdrawal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Withdrawal Fee (%)</label>
                <input
                  type="number"
                  name="withdrawalFee"
                  value={settings.withdrawalFee}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <p className="settings-description">Configure email and push notification settings.</p>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Email notifications for new registrations
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Email notifications for large withdrawals
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Email notifications for support tickets
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  Marketing emails
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="settings-description">Configure security and access control settings.</p>

              <div className="form-group">
                <label>Two-Factor Authentication</label>
                <select className="input">
                  <option>Optional</option>
                  <option>Required for admins</option>
                  <option>Required for all users</option>
                </select>
              </div>

              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  defaultValue={60}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Require email verification
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Log admin actions
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
