import React from 'react';
import { NavLink } from 'react-router-dom';
import AppRoutes from './routes';
import './styles/index.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Chemoggstry</h1>
        <nav className="tabs">
          <NavLink to="/reactions" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            🧪 База Реакций
          </NavLink>
          <NavLink to="/optimizer" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            🤖 Оптимизатор
          </NavLink>
          <NavLink to="/assistant" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            💬 AI-Ассистент
          </NavLink>
        </nav>
      </header>

      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
