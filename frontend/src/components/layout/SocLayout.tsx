import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const SocLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] to-[#070a10]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SocLayout;
