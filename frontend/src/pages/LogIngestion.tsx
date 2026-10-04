import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import tracexApi from '../services/api';
import { IngestionResult } from '../types';

export const LogIngestion: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setIsUploading(true);
      setErrorMessage(null);
      const res = await tracexApi.uploadLogs(file);
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // One-click scenario loader for Hackathon live demo
  const handleLoadDemoDataset = async () => {
    try {
      setIsUploading(true);
      setErrorMessage(null);

      // Pre-crafted full 5-stage attack scenario
      const scenarioCSV = `timestamp,event_type,source,username,source_ip,destination_ip,severity,action
2026-10-04T02:01:10Z,PORT_SCAN,network,,185.220.101.5,10.0.0.5,high,scan
2026-10-04T02:02:15Z,FIREWALL_BLOCK,network,,185.220.101.5,10.0.0.5,high,block
2026-10-04T02:03:00Z,FIREWALL_BLOCK,network,,185.220.101.5,10.0.0.5,high,block
2026-10-04T02:03:45Z,FIREWALL_BLOCK,network,,185.220.101.5,10.0.0.5,high,block
2026-10-04T02:15:00Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:15:10Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:15:20Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:15:30Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:15:40Z,LOGIN_FAILED,authentication,admin,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:16:00Z,LOGIN_FAILED,authentication,jsmith,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:16:15Z,LOGIN_FAILED,authentication,jsmith,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:16:30Z,LOGIN_FAILED,authentication,jsmith,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:16:45Z,LOGIN_FAILED,authentication,jsmith,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:17:00Z,LOGIN_FAILED,authentication,jsmith,185.220.101.5,10.0.0.5,medium,login
2026-10-04T02:17:15Z,LOGIN_SUCCESS,authentication,jsmith,185.220.101.5,10.0.0.5,info,login
2026-10-04T02:22:00Z,LOGIN_SUCCESS,authentication,jsmith,93.184.216.34,10.0.0.5,info,login
2026-10-04T02:30:10Z,PRIVILEGE_ESCALATION,server,jsmith,185.220.101.5,10.0.0.5,high,sudo
2026-10-04T02:35:00Z,DATABASE_ACCESS,server,jsmith,185.220.101.5,10.0.0.50,medium,dump
2026-10-04T02:45:00Z,OUTBOUND_TRANSFER,network,jsmith,10.0.0.50,185.220.101.5,high,exfiltration`;

      const blob = new Blob([scenarioCSV], { type: 'text/csv' });
      const demoFile = new File([blob], 'attack_scenario_full.csv', { type: 'text/csv' });
      const res = await tracexApi.uploadLogs(demoFile);
      setResult(res);
      setFile(demoFile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load demo scenario');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          Multi-Format Log Ingestion Pipeline
        </h2>
        <p className="text-xs text-slate-400">
          Upload authentication, firewall, network and server telemetry in CSV, JSON or NDJSON.
        </p>
      </div>

      {/* Demo Preset Box */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">One-Click Hackathon Demo Scenario</h3>
            <p className="text-xs text-slate-400">
              Instantly load a full 5-stage APT attack scenario (Recon, Brute Force, Initial Access, Privilege Escalation & Exfiltration).
            </p>
          </div>
        </div>

        <button
          onClick={() => handleLoadDemoDataset()}
          disabled={isUploading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {isUploading ? 'Loading...' : 'Load Full Attack Scenario'}
        </button>
      </div>

      {/* Drag & Drop Box */}
      <div className="rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 transition p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Drag & drop your log files here</p>
          <p className="text-xs text-slate-400">Supported extensions: .csv, .json, .ndjson, .jsonl</p>
        </div>

        <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition">
          Browse Computer
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv,.json,.ndjson,.jsonl,.txt,.log"
            className="hidden"
          />
        </label>

        {file && (
          <div className="flex items-center gap-2 p-2 px-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>{file.name}</span>
            <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        {file && !result && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition active:scale-95 disabled:opacity-50"
          >
            {isUploading ? 'Ingesting & Validating...' : 'Start Ingestion'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ingestion Results Dashboard */}
      {result && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 animate-scaleIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Ingestion Results & Validation Summary
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Processed in {result.duration_ms}ms</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Detected Format
              </span>
              <span className="text-base font-extrabold font-mono text-cyan-400 uppercase">
                {result.format_detected}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Total Rows
              </span>
              <span className="text-xl font-extrabold text-white">{result.total_records}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">
                Valid Events Stored
              </span>
              <span className="text-xl font-extrabold text-emerald-400">{result.valid_records}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-500 block mb-1">
                Rejected Records
              </span>
              <span className="text-xl font-extrabold text-amber-400">{result.invalid_records}</span>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Malformed Lines Skipped
              </span>
              <ul className="text-xs text-amber-200/80 space-y-1 font-mono">
                {result.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate('/events')}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              <Database className="w-4 h-4" /> View Events in Explorer
            </button>

            <button
              onClick={() => navigate('/detections')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
            >
              Proceed to Threat Detections <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
