import React, { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import DataEntry from './DataEntry';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'entry'
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Premium Header Navigation */}
      <header className="nav-header">
        <div className="brand-section">
          <span className="logo-icon">📊</span>
          <span className="brand-title">3-Idots Dashboard</span>
        </div>
        <nav className="nav-links">
          <button 
            className={`nav-button ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            📋 Dashboard
          </button>
          <button 
            className={`nav-button ${view === 'entry' ? 'active' : ''}`}
            onClick={() => setView('entry')}
          >
            ➕ Data Entry
          </button>
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </header>

      {/* Main Page Content */}
      <main className="main-content">
        {view === 'dashboard' ? (
          <Dashboard onViewChange={setView} />
        ) : (
          <DataEntry onViewChange={setView} />
        )}
      </main>
    </div>
  );
}

export default App;
