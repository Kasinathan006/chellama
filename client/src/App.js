import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';

import './App.css';

// Simple Error Boundary to catch React crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#07001a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d580ff', fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>CHELLAMA GAMING</h1>
            <p style={{ color: '#fff' }}>Loading... Please refresh</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '12px 24px', background: '#b829ff', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>
              REFRESH
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="register" element={<Register />} />
              <Route path="registered" element={<Leaderboard />} />
            </Route>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
