import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, RefreshCw, Terminal, CheckCircle2, ArrowLeft } from 'lucide-react';
import tracexApi from '../../services/api';

export const Navbar: React.FC = () => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    try {
      setIsRefreshing(true);
      const res = await tracexApi.checkHealth();
      setHealthy(res.status === 'healthy' || res.status === 'ok');
    } catch {
      setHealthy(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-purple-100 bg-white/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 group" title="Return to Public Site">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-purple-700 transition">
              Trace<span className="text-purple-600">X</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              SOC Core v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 -mt-0.5">Autonomous Security Investigation & Reconstruction</p>
        </div>
      </Link>

      {/* Center Actions / Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50/70 border border-purple-100 text-xs">
          <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span className="text-slate-500">Pipeline Status:</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50/70 border border-purple-100 text-xs">
          <span className="text-slate-500">Backend API:</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              healthy === true
                ? 'text-emerald-600'
                : healthy === false
                ? 'text-red-500'
                : 'text-amber-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                healthy === true
                  ? 'bg-emerald-500 animate-ping'
                  : healthy === false
                  ? 'bg-red-500'
                  : 'bg-amber-500'
              }`}
            />
            {healthy === true ? 'Online (PostgreSQL/SQLite)' : healthy === false ? 'Offline' : 'Connecting...'}
          </span>
          <button
            onClick={checkStatus}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-slate-700 p-0.5 ml-1 transition"
            title="Refresh connection"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50/70 border border-purple-100 text-xs text-slate-700">
          <Terminal className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-slate-500">Mode:</span>
          <span className="font-mono font-medium text-purple-700">Autonomous Threat Recon</span>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-purple-700 px-3 py-1.5 rounded-lg bg-white border border-purple-200 hover:border-purple-400 shadow-sm transition font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Public Site</span>
        </Link>
      </div>
    </header>
  );
};
