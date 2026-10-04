import React from 'react';
import { ShieldAlert, KeyRound, Crosshair, Zap, UserCheck, Cpu } from 'lucide-react';

export const DetectionRulesShowcase: React.FC = () => {
  const rules = [
    {
      id: 'RULE_BRUTE_FORCE',
      name: 'Brute Force Authentication',
      mitre: 'T1110.001',
      severity: 'high',
      threshold: '≥ 5 failures in 5 min',
      desc: 'Flags repeated failed logins against an account from a single source IP.',
      icon: KeyRound,
      color: 'red',
    },
    {
      id: 'RULE_SUCCESS_AFTER_BRUTE_FORCE',
      name: 'Successful Login Post-Failures',
      mitre: 'T1110',
      severity: 'critical',
      threshold: '≥ 3 failures before success',
      desc: 'Detects account compromise or successful brute force breach into active sessions.',
      icon: ShieldAlert,
      color: 'red',
    },
    {
      id: 'RULE_PORT_SCAN',
      name: 'Port Scan & Reconnaissance',
      mitre: 'T1595.001',
      severity: 'high',
      threshold: '≥ 5 ports or probes in 5 min',
      desc: 'Detects horizontal or vertical network probes against perimeter firewalls.',
      icon: Crosshair,
      color: 'amber',
    },
    {
      id: 'RULE_PRIVILEGE_ESCALATION',
      name: 'Suspicious Privilege Escalation',
      mitre: 'T1068',
      severity: 'high',
      threshold: 'Sudo/su within 15 min of login',
      desc: 'Identifies unauthorized or suspicious administrative command elevation.',
      icon: Zap,
      color: 'purple',
    },
    {
      id: 'RULE_SUSPICIOUS_LOGIN',
      name: 'Suspicious Multi-IP Login',
      mitre: 'T1078',
      severity: 'medium',
      threshold: '≥ 2 distinct IPs in 24 hrs',
      desc: 'Flags concurrent logins or impossible travel across divergent geographic origins.',
      icon: UserCheck,
      color: 'cyan',
    },
  ];

  return (
    <section id="detections" className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto z-10">
      <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[11px] font-mono uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5" />
          <span>DETECTION RULE CATALOG</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
          Deterministic Rule Engine.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Zero Hallucinations.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
          Every detection finding is grounded in concrete forensic evidence, calibrated thresholds, and MITRE ATT&CK taxonomy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className="p-6 rounded-2xl bg-[#06090e]/95 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/50 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono ${
                      rule.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : rule.severity === 'high'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-emerald-400 mb-1">{rule.mitre}</div>
                <h3 className="text-base font-bold text-white mb-2">{rule.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{rule.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Threshold:</span>
                <span className="text-emerald-300 font-semibold">{rule.threshold}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
