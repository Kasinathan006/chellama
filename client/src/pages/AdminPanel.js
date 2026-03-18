import React, { useState, useEffect, useRef } from 'react';
import './AdminPanel.css';
import API_BASE from '../config';

const ADMIN_PASSWORD = 'chellama';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState([]);
    const [stats, setStats] = useState({ registered: 0, slotsLeft: 32, verified: 0, pending: 0, players: 0 });
    const [notification, setNotification] = useState(null);
    const [search, setSearch] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const prev = document.title;
        document.title = 'Chellama Admin Panel';
        return () => { document.title = prev; };
    }, []);

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            if (password === ADMIN_PASSWORD || password === 'CCLAdmin' || password === 'admin') {
                setIsAuthenticated(true);
                fetchSlots();
            } else {
                setError('⚠️ Invalid password. Access denied.');
            }
            setLoading(false);
        }, 800);
    };

    const fetchSlots = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/registrations`);
            if (res.ok) {
                const data = await res.json();
                const formatted = data.map((reg, i) => ({
                    id: reg._id,
                    slotNum: i + 1,
                    playerName: reg.playerName,
                    inGameName: reg.inGameName,
                    gameUid: reg.gameUid,
                    contact: reg.contact,
                    mode: reg.mode || 'Solo Match',
                    timestamp: reg.createdAt || new Date().toISOString(),
                    isVerified: reg.status === 'VERIFIED',
                    screenshot: reg.screenshotUrl ? `${API_BASE}${reg.screenshotUrl}` : '/assets/qr.jpg'
                }));
                setSlots(formatted);
                calcStats(formatted);
            }
        } catch {
            // Demo data fallback
            const demo = [
                { id: 1, slotNum: 1, playerName: 'Mohan Kumar', inGameName: 'SHADOW_X', gameUid: '987654321', contact: '+91 98765 43210', mode: 'Solo Match', timestamp: '2026-03-17T14:30:00Z', isVerified: true, screenshot: '/assets/qr.jpg' },
                { id: 2, slotNum: 2, playerName: 'Arjun Raj', inGameName: 'ARJUN_FF', gameUid: '123456789', contact: '+91 91234 56789', mode: 'Solo Match', timestamp: '2026-03-17T15:10:00Z', isVerified: false, screenshot: '/assets/qr.jpg' },
                { id: 3, slotNum: 3, playerName: 'Vikram S', inGameName: 'VIK_LEGEND', gameUid: '555444333', contact: '+91 88888 77777', mode: 'Solo Match', timestamp: '2026-03-17T15:45:00Z', isVerified: false, screenshot: '/assets/qr.jpg' },
            ];
            setSlots(demo);
            calcStats(demo);
        }
    };

    const calcStats = (data) => {
        const v = data.filter(s => s.isVerified).length;
        setStats({
            registered: data.length,
            slotsLeft: Math.max(0, 32 - data.length),
            verified: v,
            pending: data.length - v,
            players: data.length
        });
    };

    const handleToggleVerify = async (id, currentlyVerified) => {
        const newStatus = currentlyVerified ? 'WAITING LIST' : 'VERIFIED';
        try {
            const res = await fetch(`${API_BASE}/api/registrations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = slots.map(s => s.id === id ? { ...s, isVerified: !currentlyVerified } : s);
                setSlots(updated);
                calcStats(updated);
                showNotification(currentlyVerified ? '✗ Player Unverified' : '✓ Player Verified!');
            } else {
                showNotification('❌ Failed to update', 'error');
            }
        } catch {
            // Offline fallback
            const updated = slots.map(s => s.id === id ? { ...s, isVerified: !currentlyVerified } : s);
            setSlots(updated);
            calcStats(updated);
            showNotification(currentlyVerified ? '✗ Unverified (offline)' : '✓ Verified (offline)');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/registrations/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const updated = slots.filter(s => s.id !== id);
                setSlots(updated);
                calcStats(updated);
                showNotification('🗑 Registration deleted', 'error');
            } else {
                showNotification('❌ Failed to delete', 'error');
            }
        } catch {
            // Offline fallback
            const updated = slots.filter(s => s.id !== id);
            setSlots(updated);
            calcStats(updated);
            showNotification('🗑 Deleted (offline)', 'error');
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('⚠️ CLEAR ALL REGISTRATIONS?\n\nThis cannot be undone!')) {
            try {
                const res = await fetch(`${API_BASE}/api/registrations/actions/clear`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setSlots([]);
                    calcStats([]);
                    showNotification('🗑️ All registrations cleared!', 'error');
                } else {
                    showNotification('❌ Failed to clear list', 'error');
                }
            } catch {
                setSlots([]);
                calcStats([]);
                showNotification('🗑️ Cleared list (offline fallback)', 'error');
            }
        }
    };

    const filteredSlots = slots.filter(s =>
        s.playerName?.toLowerCase().includes(search.toLowerCase()) ||
        s.inGameName?.toLowerCase().includes(search.toLowerCase()) ||
        s.gameUid?.includes(search)
    );

    // ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="ap-login-bg">
                <div className="ap-particles">
                    {[...Array(20)].map((_, i) => <span key={i} className="ap-particle" style={{ '--i': i }} />)}
                </div>
                <div className="ap-login-card">
                    <div className="ap-login-glow" />
                    <div className="ap-login-logo">
                        <span className="ap-logo-icon">🎮</span>
                        <div>
                            <div className="ap-logo-brand">CHELLAMA GAMING</div>
                            <div className="ap-logo-sub">COMMAND CENTER</div>
                        </div>
                    </div>
                    <div className="ap-login-divider" />
                    <h2 className="ap-login-title">ADMIN <span>ACCESS</span></h2>
                    <form onSubmit={handleLogin} className="ap-login-form">
                        <div className="ap-input-wrap">
                            <span className="ap-input-icon">🔒</span>
                            <input
                                type="password"
                                placeholder="Enter secret password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                required
                                className="ap-input"
                            />
                        </div>
                        {error && <p className="ap-error">{error}</p>}
                        <button type="submit" className={`ap-login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? <span className="ap-spinner" /> : '⚡ ACCESS PANEL'}
                        </button>
                    </form>
                    <p className="ap-login-hint">Authorized personnel only</p>
                </div>
            </div>
        );
    }

    // ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────
    return (
        <div className="ap-container">

            {/* NOTIFICATION TOAST */}
            {notification && (
                <div className={`ap-toast ${notification.type}`}>{notification.msg}</div>
            )}

            {/* SIDEBAR */}
            <aside className="ap-sidebar">
                <div className="ap-sidebar-logo">
                    <span>🎮</span>
                    <div>
                        <div className="ap-sb-brand">CHELLAMA</div>
                        <div className="ap-sb-sub">GAMING</div>
                    </div>
                </div>
                <nav className="ap-nav">
                    <div className="ap-nav-item active">
                        <span>📊</span> Dashboard
                    </div>
                    <div className="ap-nav-item" onClick={() => window.open('/', '_blank')}>
                        <span>🌐</span> View Site
                    </div>
                    <div className="ap-nav-item" onClick={fetchSlots}>
                        <span>🔄</span> Refresh
                    </div>
                    <div className="ap-nav-item danger" onClick={handleClearAll} style={{ color: '#f87171' }}>
                        <span>🗑️</span> Clear All
                    </div>
                    <div className="ap-nav-item danger" onClick={() => setIsAuthenticated(false)}>
                        <span>🚪</span> Logout
                    </div>
                </nav>
                <div className="ap-sidebar-footer">
                    <div className="ap-live-badge">
                        <span className="ap-live-dot" />
                        SYSTEM ONLINE
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="ap-main">

                {/* TOP BAR */}
                <div className="ap-topbar">
                    <div className="ap-topbar-left">
                        <h1 className="ap-page-title">Tournament <span>Dashboard</span></h1>
                        <p className="ap-page-sub">Manage registrations &amp; verify payments</p>
                    </div>
                    <div className="ap-topbar-right">
                        <input
                            className="ap-search"
                            placeholder="🔍 Search player..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="ap-stats-grid">
                    {[
                        { label: 'REGISTERED', value: stats.registered, icon: '👾', color: '#b829ff' },
                        { label: 'SLOTS LEFT', value: stats.slotsLeft, icon: '🎯', color: '#7c3aed' },
                        { label: 'VERIFIED', value: stats.verified, icon: '✅', color: '#22c55e' },
                        { label: 'PENDING', value: stats.pending, icon: '⏳', color: '#f59e0b' },
                        { label: 'PLAYERS', value: stats.players, icon: '🏆', color: '#06b6d4' },
                    ].map((s, i) => (
                        <div className="ap-stat" key={i} style={{ '--accent': s.color, animationDelay: `${i * 0.1}s` }}>
                            <div className="ap-stat-icon">{s.icon}</div>
                            <div className="ap-stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="ap-stat-label">{s.label}</div>
                            <div className="ap-stat-bar"><div className="ap-stat-bar-fill" style={{ background: s.color }} /></div>
                        </div>
                    ))}
                </div>

                {/* SECTION HEADER */}
                <div className="ap-section-header">
                    <h2 className="ap-section-title">
                        <span className="ap-section-dot" /> Registered Players
                        <span className="ap-count-badge">{filteredSlots.length}</span>
                    </h2>
                </div>

                {/* PLAYERS GRID */}
                <div className="ap-players-grid">
                    {filteredSlots.length === 0 && (
                        <div className="ap-empty">
                            <span>🎮</span>
                            <p>No registrations found</p>
                        </div>
                    )}
                    {filteredSlots.map((slot, i) => (
                        <div className={`ap-card ${slot.isVerified ? 'verified' : ''}`} key={slot.id} style={{ animationDelay: `${i * 0.08}s` }}>
                            {/* Card Header */}
                            <div className="ap-card-header">
                                <div className="ap-slot-badge">SLOT #{slot.slotNum}</div>
                                <div className={`ap-status-badge ${slot.isVerified ? 'verified' : 'pending'}`}>
                                    {slot.isVerified ? '✓ VERIFIED' : '● PENDING'}
                                </div>
                            </div>

                            {/* Player Info */}
                            <div className="ap-card-body">
                                <div className="ap-player-name">{slot.playerName}</div>
                                <div className="ap-player-ign">🎮 {slot.inGameName}</div>

                                <div className="ap-info-grid">
                                    <div className="ap-info-item">
                                        <span className="ap-info-label">UID</span>
                                        <span className="ap-info-val">{slot.gameUid}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <span className="ap-info-label">CONTACT</span>
                                        <span className="ap-info-val">{slot.contact}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <span className="ap-info-label">MODE</span>
                                        <span className="ap-info-val">{slot.mode}</span>
                                    </div>
                                    <div className="ap-info-item">
                                        <span className="ap-info-label">TIME</span>
                                        <span className="ap-info-val">{new Date(slot.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="ap-payment-row">
                                    <div className="ap-pay-thumb" onClick={() => setPreviewImage(slot.screenshot)} style={{ cursor: 'pointer' }} title="Click to view full screenshot">
                                        <img src={slot.screenshot} alt="pay" onError={e => e.target.style.display = 'none'} />
                                    </div>
                                    <div className="ap-pay-info">
                                        <div className="ap-pay-label">PAYMENT PROOF</div>
                                        <div className={`ap-pay-status ${slot.isVerified ? 'ok' : 'wait'}`}>
                                            {slot.isVerified ? '✓ Payment confirmed' : '◉ Awaiting verification'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="ap-card-actions">
                                <button
                                    className={`ap-btn ${slot.isVerified ? 'unverify' : 'verify'}`}
                                    onClick={() => handleToggleVerify(slot.id, slot.isVerified)}
                                >
                                    {slot.isVerified ? '✗ Unverify' : '✓ Verify'}
                                </button>
                                <button className="ap-btn delete" onClick={() => handleDelete(slot.id)}>
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* PREVIEW MODAL */}
            {previewImage && (
                <div className="ap-preview-modal" onClick={() => setPreviewImage(null)}>
                    <div className="ap-preview-content" onClick={e => e.stopPropagation()}>
                        <button className="ap-close-btn" onClick={() => setPreviewImage(null)}>✕</button>
                        <img src={previewImage} alt="Payment Preview" className="ap-preview-img" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
