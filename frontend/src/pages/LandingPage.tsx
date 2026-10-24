import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/tracex-landing.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeConsoleTab, setActiveConsoleTab] = useState<'events' | 'analysis' | 'graph'>('events');
  const [activeStage, setActiveStage] = useState<number>(4); // Stage 05 (0-indexed: 4) active like mockup

  const handleLoadScenario = () => {
    // Navigate to SOC with APT scenario query
    navigate('/soc?scenario=apt');
  };

  return (
    <div className="tracex-landing">
      {/* Background Watermark */}
      <div className="hero-watermark" aria-hidden="true">
        TRACEX
      </div>

      {/* Top Sticky Navigation */}
      <nav className="tx-navbar">
        <div className="tx-nav-inner">
          <Link to="/" className="tx-logo">
            <span className="tx-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </span>
            <span>Trace<span className="tx-logo-accent">X</span></span>
          </Link>

          <div className="tx-nav-menu">
            <Link to="/" className="tx-nav-link active">Overview</Link>
            <Link to="/soc" className="tx-nav-link">SOC Dashboard</Link>
            <Link to="/incidents" className="tx-nav-link">Timeline</Link>
            <Link to="/detections" className="tx-nav-link">Detections</Link>
            <Link to="/events" className="tx-nav-link">Event Logs</Link>
            <Link to="/incidents" className="tx-nav-link">Reports</Link>
          </div>

          <button onClick={() => navigate('/soc')} className="tx-btn-lime">
            Open Workspace
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="tx-hero">
        <div className="tx-container">
          <div className="tx-hero-grid">
            {/* Left Column */}
            <div className="tx-hero-left">
              <div className="tx-hero-tag">
                <span className="tx-pulse-dot" />
                AUTONOMOUS INVESTIGATION & ATTACK RECONSTRUCTION
              </div>

              <h1 className="tx-hero-title">
                Turn fragmented<br />
                security logs<br />
                into <span className="italic-lime">cohesive attack<br />stories.</span>
              </h1>

              <p className="tx-hero-desc">
                TraceX ingests multi-source authentication, firewall and server telemetry, correlates detections into MITRE-aligned detection rules, and reconstructs a 5-stage causal intrusion story with zero tedious clicks.
              </p>

              <div className="tx-hero-actions">
                <button onClick={() => navigate('/soc')} className="tx-btn-lime">
                  Open SOC Workspace
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <button onClick={handleLoadScenario} className="tx-btn-dark">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Load Full Scenario
                </button>
              </div>
            </div>

            {/* Right Column: Console Mock Window */}
            <div className="tx-console-card">
              <div className="tx-console-header">
                <div className="tx-console-tabs">
                  <button
                    className={`tx-console-tab ${activeConsoleTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveConsoleTab('events')}
                  >
                    EVENT STREAM
                  </button>
                  <button
                    className={`tx-console-tab ${activeConsoleTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveConsoleTab('analysis')}
                  >
                    INCIDENT ANALYSIS
                  </button>
                  <button
                    className={`tx-console-tab ${activeConsoleTab === 'graph' ? 'active' : ''}`}
                    onClick={() => setActiveConsoleTab('graph')}
                  >
                    CAUSAL GRAPH
                  </button>
                </div>
                <div className="tx-console-status">
                  <span className="tx-pulse-dot" />
                  Live Correlation Active
                </div>
              </div>

              <div className="tx-console-main">
                {/* Event stream rows */}
                <div className="tx-event-rows">
                  <div className="tx-event-row">
                    <span className="tx-event-time">02:14:07</span>
                    <span className="tx-event-type">AUTH_BRUTE_FORCE</span>
                    <span className="tx-event-target">185.220.101.47</span>
                  </div>
                  <div className="tx-event-row">
                    <span className="tx-event-time">02:31:52</span>
                    <span className="tx-event-type">VPN_LOGIN</span>
                    <span className="tx-event-target">m.okafor (Geo)</span>
                  </div>
                  <div className="tx-event-row">
                    <span className="tx-event-time">02:38:10</span>
                    <span className="tx-event-type">POWERSHELL_EXEC</span>
                    <span className="tx-event-target">WS-FIN-022</span>
                  </div>
                  <div className="tx-event-row">
                    <span className="tx-event-time">02:44:19</span>
                    <span className="tx-event-type">FILE_READ</span>
                    <span className="tx-event-target">FS-ARCHIVE</span>
                  </div>
                  <div className="tx-event-row">
                    <span className="tx-event-time">02:52:44</span>
                    <span className="tx-event-type">DATA_EXFIL</span>
                    <span className="tx-event-target">45.137.21.9</span>
                  </div>
                </div>

                {/* Mini Causal Graph */}
                <div className="tx-mini-graph">
                  <svg width="100%" height="100%" viewBox="0 0 180 120" fill="none">
                    {/* Connection lines */}
                    <path d="M 20 60 Q 55 25 80 50 T 130 35 T 165 75" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                    <line x1="20" y1="60" x2="60" y2="90" stroke="rgba(163, 230, 53, 0.4)" strokeWidth="1.5" />
                    <line x1="60" y1="90" x2="110" y2="85" stroke="rgba(163, 230, 53, 0.4)" strokeWidth="1.5" />
                    <line x1="110" y1="85" x2="165" y2="75" stroke="#a3e635" strokeWidth="1.5" />
                    
                    {/* Node 1 */}
                    <circle cx="20" cy="60" r="5" fill="#a3e635" />
                    <circle cx="20" cy="60" r="9" stroke="rgba(163, 230, 53, 0.3)" strokeWidth="1.5" />
                    
                    {/* Node 2 */}
                    <circle cx="60" cy="90" r="4" fill="#a3e635" />
                    
                    {/* Node 3 */}
                    <circle cx="80" cy="50" r="5" fill="#a3e635" />
                    <circle cx="80" cy="50" r="9" stroke="rgba(163, 230, 53, 0.3)" strokeWidth="1.5" />
                    
                    {/* Node 4 */}
                    <circle cx="110" cy="85" r="4" fill="#a3e635" />
                    
                    {/* Node 5 */}
                    <circle cx="130" cy="35" r="5" fill="#a3e635" />

                    {/* Node 6 (Target) */}
                    <circle cx="165" cy="75" r="6" fill="#a3e635" />
                    <circle cx="165" cy="75" r="11" stroke="#a3e635" strokeWidth="1.5" opacity="0.5" />
                  </svg>
                </div>
              </div>

              {/* Console Evidence Drawer */}
              <div className="tx-console-evidence">
                <div className="tx-evidence-top">
                  <span className="tx-evidence-label">EVIDENCE CORRELATION</span>
                  <div className="tx-evidence-conf">
                    <span>Confidence: 95%</span>
                    <div className="tx-conf-bar">
                      <div className="tx-conf-fill" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>

                <div className="tx-evidence-meta">
                  <span>Target: <strong>DC-01, FS-ARCHIVE</strong></span>
                  <span>Victim: <strong>m.okafor</strong></span>
                  <span>Attacker: <strong>185.220.101.47</strong></span>
                </div>

                <div className="tx-evidence-story">
                  "185.220.101.47 brute-forced admin, escalated privileges, and staged 4.2GB payroll data."
                </div>
              </div>

              <div className="tx-console-footer">
                <button onClick={() => navigate('/soc')}>INVESTIGATE INCIDENT</button>
                <button onClick={() => navigate('/soc')}>VIEW FULL GRAPH</button>
                <button onClick={() => navigate('/incidents')}>EXPORT EVIDENCE PACK</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Pipeline Bar: LIVE ATTACK RECONSTRUCTION ENGINE */}
      <section className="tx-pipeline-section">
        <div className="tx-container">
          <div className="tx-pipeline-card">
            <div className="tx-pipeline-header">
              <div className="tx-pipeline-title-group">
                <div className="tx-pipeline-title">
                  <span className="tx-pulse-dot" />
                  LIVE ATTACK RECONSTRUCTION ENGINE
                </div>
                <div className="tx-pipeline-meta">
                  Target IP: <span>185.220.101.47</span> · <span>5-stage causal chain</span>
                </div>
              </div>
              <button onClick={() => navigate('/soc')} className="tx-btn-dark">
                Explore interactive progression ↗
              </button>
            </div>

            <div className="tx-stages-row">
              {/* Stage 01 */}
              <div
                className={`tx-stage-box ${activeStage === 0 ? 'active' : ''}`}
                onClick={() => setActiveStage(0)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tx-stage-num">Stage 01</div>
                <div className="tx-stage-name">Reconnaissance</div>
                <div className="tx-stage-status">Done · Port sweep (412 probes)</div>
              </div>

              {/* Stage 02 */}
              <div
                className={`tx-stage-box ${activeStage === 1 ? 'active' : ''}`}
                onClick={() => setActiveStage(1)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tx-stage-num">Stage 02</div>
                <div className="tx-stage-name">Credential Access</div>
                <div className="tx-stage-status">Done · Spray 38 accounts</div>
              </div>

              {/* Stage 03 */}
              <div
                className={`tx-stage-box ${activeStage === 2 ? 'active' : ''}`}
                onClick={() => setActiveStage(2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tx-stage-num">Stage 03</div>
                <div className="tx-stage-name">Initial Access</div>
                <div className="tx-stage-status">Done · Sign-in m.okafor</div>
              </div>

              {/* Stage 04 */}
              <div
                className={`tx-stage-box ${activeStage === 3 ? 'active' : ''}`}
                onClick={() => setActiveStage(3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tx-stage-num">Stage 04</div>
                <div className="tx-stage-name">Privilege Escalation</div>
                <div className="tx-stage-status">Done · Sudo WS-FIN-022</div>
              </div>

              {/* Stage 05 (Active highlighted glowing box) */}
              <div
                className={`tx-stage-box ${activeStage === 4 ? 'active' : ''}`}
                onClick={() => setActiveStage(4)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tx-stage-num">Stage 05</div>
                <div className="tx-stage-name">Data Impact</div>
                <div className="tx-stage-status">Active · Outbound 4.2GB staged</div>
              </div>
            </div>

            <div className="tx-pipeline-footer">
              <div>Table view / Network graph / Forensic trace</div>
              <div>Reconstructed in 0.032s (12,184 raw events → 5-stage causal chain)</div>
              <div className="tx-chain-badge">Chain Alert Severity: High 95</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: "From scattered logs to a readable attack story." */}
      <section className="tx-process-section">
        <div className="tx-container">
          <div className="tx-section-tag">HOW TRACEX WORKS</div>
          <h2 className="tx-section-title">
            From scattered logs to a<br />
            <span className="italic-lime">readable</span> attack story.
          </h2>

          <div className="tx-process-cards">
            {/* Card 01 - Ingest Logs */}
            <div className="tx-process-card">
              <div className="tx-process-card-num">01</div>
              <div className="tx-process-graphic">
                <div className="tx-stepped-bars">
                  <div className="tx-stepped-bar" style={{ height: '8px' }} />
                  <div className="tx-stepped-bar" style={{ height: '14px' }} />
                  <div className="tx-stepped-bar" style={{ height: '20px' }} />
                  <div className="tx-stepped-bar" style={{ height: '26px' }} />
                  <div className="tx-stepped-bar" style={{ height: '32px' }} />
                </div>
              </div>
              <h3 className="tx-process-title">Ingest Logs</h3>
              <p className="tx-process-desc">
                Multi-source log normalization, firewall and server telemetry, automated schema mapping, that reads raw logs from any source without manual regex.
              </p>
              <Link to="/ingestion" className="tx-process-link">
                Open Logs →
              </Link>
            </div>

            {/* Card 02 - Detect Threats */}
            <div className="tx-process-card">
              <div className="tx-process-card-num">02</div>
              <div className="tx-process-graphic">
                <div className="tx-radar-dots">
                  <span className="tx-radar-dot" style={{ opacity: 0.3, transform: 'scale(0.8)' }} />
                  <span className="tx-radar-dot" style={{ opacity: 0.6, transform: 'scale(1)' }} />
                  <span className="tx-radar-dot" style={{ opacity: 1, transform: 'scale(1.2)' }} />
                  <span className="tx-radar-dot" style={{ opacity: 0.6, transform: 'scale(1)' }} />
                  <span className="tx-radar-dot" style={{ opacity: 0.3, transform: 'scale(0.8)' }} />
                </div>
              </div>
              <h3 className="tx-process-title">Detect Threats</h3>
              <p className="tx-process-desc">
                Deterministic MITRE-aligned rules evaluate every event point-by-point, detecting brute-force bursts, impossible travel, and privilege escalation.
              </p>
              <Link to="/detections" className="tx-process-link">
                See all rules →
              </Link>
            </div>

            {/* Card 03 - Reconstruct Attack */}
            <div className="tx-process-card">
              <div className="tx-process-card-num">03</div>
              <div className="tx-process-graphic">
                <div className="tx-node-line">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                  <div className="tx-dash-line" />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a3e635' }} />
                  <div className="tx-dash-line" />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>
              <h3 className="tx-process-title">Reconstruct Attack</h3>
              <p className="tx-process-desc">
                Time-window correlation links disconnected events across IPs, users, and processes into a single unified intrusion graph.
              </p>
              <Link to="/soc" className="tx-process-link">
                Explore causal chain →
              </Link>
            </div>

            {/* Card 04 - Investigate & Respond */}
            <div className="tx-process-card">
              <div className="tx-process-card-num">04</div>
              <div className="tx-process-graphic">
                <div className="tx-seg-bars">
                  <div className="tx-seg-bar" />
                  <div className="tx-seg-bar" />
                  <div className="tx-seg-bar" />
                  <div className="tx-seg-bar" />
                  <div className="tx-seg-bar" />
                </div>
              </div>
              <h3 className="tx-process-title">Investigate & Respond</h3>
              <p className="tx-process-desc">
                Open the incident narrative with forensic precision, view chain evidence, inspect source telemetry, and export executive reports.
              </p>
              <Link to="/soc" className="tx-process-link">
                Open SOC Workspace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: "The 5 pillars of autonomous attack reconstruction." */}
      <section className="tx-pillars-section">
        <div className="tx-container">
          <div className="tx-pillars-header">
            <div className="tx-section-tag">DETERMINISTIC CAUSAL CORRELATION</div>
            <h2 className="tx-section-title">
              The 5 pillars of<br />
              <span className="italic-lime">autonomous</span> attack<br />
              reconstruction.
            </h2>
            <p className="tx-pillars-desc">
              TraceX links events across time windows and entities, so analysts never have to stitch together logs manually.
            </p>
          </div>

          <div className="tx-pillars-grid">
            {/* Pillar 01 */}
            <div className="tx-pillar-card">
              <div className="tx-pillar-num">01</div>
              <h3 className="tx-pillar-title">Perimeter Reconnaissance</h3>
              <p className="tx-pillar-desc">
                External port sweeps and port inventory, SYN flood probes, and external firewall block patterns across perimeter firewalls.
              </p>
              <div className="tx-pillar-footer">
                <span>412 PORT PROBES · 185.220.101.47</span>
                <span>ETA: T+0m</span>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="tx-pillar-card">
              <div className="tx-pillar-num">02</div>
              <h3 className="tx-pillar-title">Credential Probing & Access</h3>
              <p className="tx-pillar-desc">
                Calculates timing windows from brute force to token authentications to identify brute-force spray attacks and password spray.
              </p>
              <div className="tx-pillar-footer">
                <span>AUTH SPRAY: 38 ACC</span>
                <span>ETA: T+17m</span>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="tx-pillar-card">
              <div className="tx-pillar-num">03</div>
              <h3 className="tx-pillar-title">Compromise Verification</h3>
              <p className="tx-pillar-desc">
                Flags impossible travel and firewall bypassing, immediate post-failure logins confirming credential-backed intrusion.
              </p>
              <div className="tx-pillar-footer">
                <span>GEO: NIGERIA → UK</span>
                <span>ETA: T+21m</span>
              </div>
            </div>

            {/* Pillar 04 */}
            <div className="tx-pillar-card">
              <div className="tx-pillar-num">04</div>
              <h3 className="tx-pillar-title">Privilege Elevation & Sudo</h3>
              <p className="tx-pillar-desc">
                Correlates administrative escalation actions (sudo, setuid) proceeding into unauthorized access within 15 minutes.
              </p>
              <div className="tx-pillar-footer">
                <span>RULE: PRIV_ESCALATION_SUDO</span>
                <span>ETA: T+32m</span>
              </div>
            </div>

            {/* Pillar 05 */}
            <div className="tx-pillar-card">
              <div className="tx-pillar-num">05</div>
              <h3 className="tx-pillar-title">Sensitive Data Impact & Egress</h3>
              <p className="tx-pillar-desc">
                Identifies large compressed file transfers across the network boundary and outbound data egress to external C2 nodes.
              </p>
              <div className="tx-pillar-footer">
                <span>4.2 GB ARCHIVE → 45.137.21.9</span>
                <span>ETA: T+46m</span>
              </div>
            </div>

            {/* Pillar 06: Featured Interactive Topology */}
            <div className="tx-pillar-card tx-pillar-featured">
              <div className="tx-topology-visual">
                <svg width="100%" height="100%" viewBox="0 0 200 60" fill="none">
                  <path d="M 15 35 Q 50 15 85 40 T 145 20 T 185 45" stroke="#a3e635" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="15" cy="35" r="4" fill="#a3e635" />
                  <circle cx="50" cy="22" r="3" fill="#a3e635" opacity="0.6" />
                  <circle cx="85" cy="40" r="5" fill="#a3e635" />
                  <circle cx="145" cy="20" r="5" fill="#a3e635" />
                  <circle cx="185" cy="45" r="6" fill="#a3e635" />
                  <circle cx="185" cy="45" r="10" stroke="#a3e635" strokeWidth="1" opacity="0.4" />
                </svg>
              </div>
              <h3 className="tx-pillar-title">Interactive Attack Topology</h3>
              <p className="tx-pillar-desc">
                Explore the full causal sequence on an interactive force graph with animated connection links and an inspector drawer.
              </p>
              <button
                onClick={() => navigate('/soc')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--tx-lime)',
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Explore active topology →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: "Every conclusion shows its work." Bento Grid */}
      <section className="tx-bento-section">
        <div className="tx-container">
          <div className="tx-section-tag">CORE CAPABILITIES</div>
          <h2 className="tx-section-title">
            Every conclusion <span className="italic-lime">shows its<br />work.</span>
          </h2>

          <div className="tx-bento-grid">
            {/* Card 1: Attack graph analysis */}
            <div className="tx-bento-card">
              <h3 className="tx-bento-title">Attack graph analysis</h3>
              <p className="tx-bento-desc">
                Source IPs, accounts, hosts, and destinations become correlated nodes connected by causal lines into the full path the attacker took.
              </p>

              <div className="tx-spline-container">
                <svg width="100%" height="100%" viewBox="0 0 450 120" fill="none">
                  {/* Glowing background path */}
                  <path
                    d="M 20 85 C 90 85, 120 40, 180 40 C 240 40, 270 80, 340 70 C 380 65, 400 45, 430 45"
                    stroke="rgba(163, 230, 53, 0.2)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Main path */}
                  <path
                    d="M 20 85 C 90 85, 120 40, 180 40 C 240 40, 270 80, 340 70 C 380 65, 400 45, 430 45"
                    stroke="#a3e635"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* 5 Circular Nodes */}
                  <circle cx="20" cy="85" r="7" fill="#a3e635" />
                  <circle cx="20" cy="85" r="12" stroke="#a3e635" strokeWidth="1.5" opacity="0.4" />

                  <circle cx="180" cy="40" r="7" fill="#a3e635" />
                  <circle cx="180" cy="40" r="12" stroke="#a3e635" strokeWidth="1.5" opacity="0.4" />

                  <circle cx="260" cy="62" r="5" fill="#a3e635" />

                  <circle cx="340" cy="70" r="7" fill="#a3e635" />
                  <circle cx="340" cy="70" r="12" stroke="#a3e635" strokeWidth="1.5" opacity="0.4" />

                  <circle cx="430" cy="45" r="7" fill="#a3e635" />
                  <circle cx="430" cy="45" r="14" stroke="#a3e635" strokeWidth="1.5" opacity="0.5" />
                </svg>
              </div>
            </div>

            {/* Card 2: MITRE ATT&CK mapping */}
            <div className="tx-bento-card">
              <h3 className="tx-bento-title">MITRE ATT&CK mapping</h3>
              <p className="tx-bento-desc">
                Each detection carries a MITRE ATT&CK technique: T1078, T1059, T1003, T1068, T1048.
              </p>

              <div className="tx-mitre-badges">
                <span className="tx-mitre-badge active-lime">T1078 Valid Accounts</span>
                <span className="tx-mitre-badge active-lime">T1059 Command Exec</span>
                <span className="tx-mitre-badge active-lime">T1003 Credential Access</span>
                <span className="tx-mitre-badge dark-badge">T1068 Priv Escalation</span>
                <span className="tx-mitre-badge dark-badge">T1048 Data Exfiltration</span>
                <span className="tx-mitre-badge active-lime">T1046 Network Scan</span>
              </div>
            </div>

            {/* Card 3: Evidence correlation */}
            <div className="tx-bento-card">
              <h3 className="tx-bento-title">Evidence correlation</h3>
              <p className="tx-bento-desc">
                Authentication, firewall, and server records are pinned by entity and time window, from initial scan to real event.
              </p>

              <div className="tx-evidence-pills">
                <span className="tx-evidence-pill">AUTH LOGS</span>
                <span className="tx-evidence-pill">FIREWALL</span>
                <span className="tx-evidence-pill">SERVER SYSQUERY</span>
                <span className="tx-evidence-pill">AUDIT TRAIL</span>
              </div>
            </div>

            {/* Card 4: Forensic timelines */}
            <div className="tx-bento-card">
              <h3 className="tx-bento-title">Forensic timelines</h3>
              <p className="tx-bento-desc">
                An ordered sequence of what happened when, from first probe at 02:14 to egress at 02:52 in the sample case.
              </p>

              <div className="tx-timeline-bars">
                {[15, 25, 20, 35, 30, 45, 90, 85, 40, 25, 30, 60, 100, 35, 20, 15].map((h, i) => (
                  <div
                    key={i}
                    className={`tx-time-bar ${h >= 85 ? 'active' : ''}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Card 5: Explainable threat narratives (Full width) */}
            <div className="tx-bento-card tx-bento-card-full">
              <h3 className="tx-bento-title">Explainable threat narratives</h3>
              <p className="tx-bento-desc">
                Narratives are generated from deterministic rule evidence, not guessed. Each statement cites the events forming it, so analysts can verify instead of trust.
              </p>

              <div className="tx-narrative-box">
                <div className="tx-narrative-tag">INCIDENT #4821 — CAUSAL CHAIN DETAIL</div>
                <div className="tx-narrative-text">
                  "185.220.101.47 scanned 10.20.6.11<span className="tx-narrative-ref">[1]</span>, brute-forced admin<span className="tx-narrative-ref">[2]</span>, logged in<span className="tx-narrative-ref">[3]</span>, escalated with sudo<span className="tx-narrative-ref">[4]</span>, and sent 4.2GB to 45.137.21.9<span className="tx-narrative-ref">[5]</span>."
                </div>

                <div className="tx-narrative-footnotes">
                  <span>[1] FW-BLOCK-PORT-SCAN</span>
                  <span>[2] AUTH_BRUTE_FORCE</span>
                  <span>[3] IMPOSSIBLE_TRAVEL_LOGIN</span>
                  <span>[4] SUDO_ELEVATION</span>
                  <span>[5] EGRESS_DATA_IMPACT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="tx-cta-section">
        <div className="tx-cta-glow" />
        <div className="tx-container">
          <h2 className="tx-cta-title">
            Every intrusion is a<br />
            story. <span className="italic-lime">Read it in minutes.</span>
          </h2>

          <div className="tx-cta-actions">
            <button onClick={() => navigate('/soc')} className="tx-btn-lime" style={{ padding: '12px 26px', fontSize: '14px' }}>
              Open SOC Workspace
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button onClick={handleLoadScenario} className="tx-btn-dark" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Load Full Scenario
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tx-footer">
        <div className="tx-footer-inner">
          <div className="tx-footer-brand">
            <Link to="/" className="tx-logo">
              <span>Trace<span className="tx-logo-accent">X</span></span>
            </Link>
            <span>Autonomous Cybersecurity Investigation & Attack Reconstruction</span>
          </div>

          <div className="tx-footer-links">
            <Link to="/soc">SOC Dashboard</Link>
            <Link to="/incidents">Incidents</Link>
            <Link to="/detections">Detections</Link>
            <Link to="/events">Telemetry</Link>
            <span>© 2026 TraceX</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
