import React, { useState, useEffect } from 'react';
import { Shield, Activity, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
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
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              Trace<span className="text-cyan-400">X</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              SOC Core v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 -mt-0.5">Autonomous Security Investigation & Reconstruction</p>
        </div>
      </div>

      {/* Center Actions / Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">Pipeline Status:</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <span className="text-slate-400">Backend API:</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              healthy === true
                ? 'text-emerald-400'
                : healthy === false
                ? 'text-red-400'
                : 'text-amber-400'
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
            className="text-slate-400 hover:text-white p-0.5 ml-1 transition"
            title="Refresh connection"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Mode:</span>
          <span className="font-mono font-medium text-cyan-300">Autonomous Threat Recon</span>
        </div>
      </div>
    </header>
  );
};
