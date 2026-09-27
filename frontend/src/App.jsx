import React from 'react';
import { NavLink } from 'react-router-dom';
import AppRoutes from './routes';
import './styles/index.css';

function App() {
  return (
    <div className="app-container">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          chem<span>MOGGstry</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/reactions"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">🧪</span>
            Reaction Database
          </NavLink>

          <NavLink
            to="/optimizer"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            Optimizer
          </NavLink>

          <NavLink
            to="/assistant"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">💬</span>
            AI Assistant
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-avatar">U</div>
          User
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
