import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const SocLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col text-slate-800 font-sans selection:bg-purple-200 selection:text-purple-900">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f8f7fc] to-[#f3f0fa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SocLayout;
