import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-emerald-950/40 bg-[#05080d]/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between transition-all">
      {/* Coordinates snippet like in collage */}
      <div className="absolute top-2 left-6 text-[10px] font-mono text-emerald-500/40 hidden md:block">
        [ 128.04, 86.16, 22.71 ]
      </div>
      <div className="absolute top-2 right-6 text-[10px] font-mono text-emerald-500/40 hidden md:block">
        [ 97.22, 19.11, 08.44 ]
      </div>

      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white font-mono">
              Trace<span className="text-emerald-400">X</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hidden sm:inline-block">
              AI Cyber Sec
            </span>
          </div>
          <span className="text-[10px] tracking-widest text-emerald-500/70 uppercase font-semibold block -mt-1 font-mono">
            FIND THE INTRUDER
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
        <a
          href="#product"
          className="hover:text-emerald-400 transition tracking-wide"
        >
          Product
        </a>
        <a
          href="#how-it-works"
          className="text-emerald-400 font-bold border-b border-emerald-400/40 pb-0.5 tracking-wide"
        >
          How It Works
        </a>
        <a
          href="#detections"
          className="hover:text-emerald-400 transition tracking-wide"
        >
          Detection
        </a>
        <a
          href="#investigation"
          className="hover:text-emerald-400 transition tracking-wide"
        >
          Investigation
        </a>
        <a
          href="#preview"
          className="hover:text-emerald-400 transition tracking-wide"
        >
          SOC Dashboard
        </a>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Link
          to="/soc"
          className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition hidden sm:block"
        >
          Sign In
        </Link>
        <Link
          to="/soc"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition active:scale-95"
        >
          <span>Open SOC</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </Link>
      </div>
    </header>
  );
};
