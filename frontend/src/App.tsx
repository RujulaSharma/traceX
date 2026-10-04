import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LogIngestion } from './pages/LogIngestion';
import { EventExplorer } from './pages/EventExplorer';
import { Detections } from './pages/Detections';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#090d16] flex flex-col text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] to-[#070a10]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ingestion" element={<LogIngestion />} />
              <Route path="/events" element={<EventExplorer />} />
              <Route path="/detections" element={<Detections />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/:id" element={<IncidentDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
