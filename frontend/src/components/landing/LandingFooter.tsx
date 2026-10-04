import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2 } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative border-t border-emerald-950/40 bg-[#04060a] py-16 px-6 lg:px-12 z-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        {/* Brand */}
        <div className="space-y-3 max-w-sm">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-mono text-base font-extrabold text-white">
              Trace<span className="text-emerald-400">X</span>
            </span>
          </Link>
          <p className="text-slate-400 leading-relaxed font-light">
            Autonomous cybersecurity investigation platform designed to reconstruct multi-stage cyber intrusions from authentication, network, and server telemetry.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Problem ALG-CYBER-01: Find the Intruder</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div className="space-y-2.5">
            <div className="font-bold uppercase tracking-wider text-white text-[11px] font-mono">
              Product
            </div>
            <div className="space-y-1.5 flex flex-col">
              <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
              <a href="#detections" className="hover:text-emerald-400 transition">Detection Rules</a>
              <a href="#investigation" className="hover:text-emerald-400 transition">Investigation</a>
              <a href="#preview" className="hover:text-emerald-400 transition">SOC Preview</a>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="font-bold uppercase tracking-wider text-white text-[11px] font-mono">
              SOC Workspace
            </div>
            <div className="space-y-1.5 flex flex-col">
              <Link to="/soc" className="hover:text-emerald-400 transition text-emerald-400 font-semibold">
                Open SOC Console →
              </Link>
              <Link to="/ingestion" className="hover:text-emerald-400 transition">Log Ingestion</Link>
              <Link to="/events" className="hover:text-emerald-400 transition">Event Explorer</Link>
              <Link to="/detections" className="hover:text-emerald-400 transition">Threat Detections</Link>
              <Link to="/incidents" className="hover:text-emerald-400 transition">Incidents & Graph</Link>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="font-bold uppercase tracking-wider text-white text-[11px] font-mono">
              Technology
            </div>
            <div className="space-y-1.5 flex flex-col text-slate-400 font-mono text-[11px]">
              <span>FastAPI / Python</span>
              <span>SQLAlchemy 2.0</span>
              <span>React 18 / Vite</span>
              <span>MITRE ATT&CK</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
        <span>© 2026 TraceX. Built for Cybersecurity Hackathon.</span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500">System Status: Operational</span>
          <span>•</span>
          <Link to="/soc" className="text-slate-300 hover:text-emerald-400 transition font-bold">
            Launch SOC →
          </Link>
        </div>
      </div>
    </footer>
  );
};
