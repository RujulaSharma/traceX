import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SocLayout } from './components/layout/SocLayout';
import { Dashboard } from './pages/Dashboard';
import { LogIngestion } from './pages/LogIngestion';
import { EventExplorer } from './pages/EventExplorer';
import { Detections } from './pages/Detections';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Homepage / Landing with Living Network Experience */}
        <Route path="/" element={<LandingPage />} />

        {/* Operational Security Operations Center (SOC) Workspace */}
        <Route element={<SocLayout />}>
          <Route path="/soc" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ingestion" element={<LogIngestion />} />
          <Route path="/events" element={<EventExplorer />} />
          <Route path="/detections" element={<Detections />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
