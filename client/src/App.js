import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="register" element={<Register />} />
                <Route path="registered" element={<Leaderboard />} />
              </Route>
              {/* Admin route outside MainLayout if it shouldn't have the normal Navbar/Footer */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
