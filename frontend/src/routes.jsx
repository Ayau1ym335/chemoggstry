import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ReactionsPage from './pages/Reactions';
import OptimizerPage from './pages/Optimizer';
import AssistantPage from './pages/Assistant';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/reactions" replace />} />
      <Route path="/reactions" element={<ReactionsPage />} />
      <Route path="/optimizer" element={<OptimizerPage />} />
      <Route path="/assistant" element={<AssistantPage />} />
    </Routes>
  );
}
