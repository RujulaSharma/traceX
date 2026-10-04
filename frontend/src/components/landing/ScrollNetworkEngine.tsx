import React, { useEffect, useRef } from 'react';

interface ScrollNetworkEngineProps {
  progress: number; // 0.0 to 1.0
  activeStage: number; // 1 to 5
}

interface BgNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

interface MidClusterNode {
  clusterId: number;
  offsetX: number;
  offsetY: number;
  radius: number;
  color: string;
}

interface FgNodeConfig {
  id: string;
  label: string;
  sublabel?: string;
  type: 'attacker' | 'user' | 'detection' | 'incident' | 'target' | 'normal';
  color: string;
  glowColor: string;
  radius: number;
  // Normalized coordinates (0.0 to 1.0) for each of the 5 stages
  stages: Array<{ x: number; y: number; alpha: number; scale?: number }>;
}

interface EdgeConnection {
  from: string;
  to: string;
  // Min progress when this edge starts appearing and reaches full opacity
  appearAt: number;
  fullAt: number;
  color?: string;
  isAttackPath?: boolean;
}

interface DataPulse {
  edgeIndex: number;
  t: number; // 0.0 to 1.0
  speed: number;
}

export const ScrollNetworkEngine: React.FC<ScrollNetworkEngineProps> = ({
  progress,
  activeStage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  // Keep progress in a ref for smooth 60fps animation frame reads
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const activeStageRef = useRef(activeStage);
  activeStageRef.current = activeStage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. FOREGROUND NODES (Key security entities across 5 stages)
    const fgNodes: FgNodeConfig[] = [
      // Attacker IP Node
      {
        id: 'attacker_ip',
        label: '185.23.91.44',
        sublabel: 'ATTACKER IP',
        type: 'attacker',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.8)',
        radius: 7,
        stages: [
          { x: 0.15, y: 0.25, alpha: 0.4 }, // Stage 1: Lost in noise
          { x: 0.20, y: 0.35, alpha: 0.8 }, // Stage 2: Suspicious origin
          { x: 0.22, y: 0.45, alpha: 0.95 }, // Stage 3: Correlating ingress
          { x: 0.38, y: 0.48, alpha: 0.9 }, // Stage 4: Pulling into incident
          { x: 0.12, y: 0.50, alpha: 1.0, scale: 1.2 }, // Stage 5: Ingress origin on left
        ],
      },
      // Port Scan Node
      {
        id: 'port_scan',
        label: 'PORT SCAN',
        sublabel: 'T1595 Recon',
        type: 'detection',
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.8)',
        radius: 6,
        stages: [
          { x: 0.28, y: 0.18, alpha: 0.3 },
          { x: 0.32, y: 0.30, alpha: 0.9 }, // Lights up in Detection
          { x: 0.34, y: 0.36, alpha: 0.95 },
          { x: 0.42, y: 0.45, alpha: 0.85 },
          { x: 0.28, y: 0.32, alpha: 1.0 }, // Branches above
        ],
      },
      // Brute Force Node
      {
        id: 'brute_force',
        label: 'BRUTE FORCE',
        sublabel: 'T1110 6 Failures',
        type: 'detection',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.8)',
        radius: 6.5,
        stages: [
          { x: 0.22, y: 0.65, alpha: 0.3 },
          { x: 0.28, y: 0.55, alpha: 0.95 }, // Lights up
          { x: 0.35, y: 0.50, alpha: 0.95 },
          { x: 0.44, y: 0.50, alpha: 0.9 },
          { x: 0.28, y: 0.68, alpha: 1.0 }, // Branches below
        ],
      },
      // Compromised User Node
      {
        id: 'user_admin',
        label: 'admin (root)',
        sublabel: 'COMPROMISED USER',
        type: 'user',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.8)',
        radius: 7,
        stages: [
          { x: 0.72, y: 0.35, alpha: 0.4 },
          { x: 0.60, y: 0.42, alpha: 0.7 },
          { x: 0.50, y: 0.48, alpha: 0.95 },
          { x: 0.48, y: 0.50, alpha: 0.9 },
          { x: 0.46, y: 0.50, alpha: 1.0, scale: 1.15 }, // Central victim identity
        ],
      },
      // Privilege Escalation Node
      {
        id: 'priv_esc',
        label: 'PRIVILEGE ESCALATION',
        sublabel: 'T1068 sudo /etc/shadow',
        type: 'detection',
        color: '#f97316',
        glowColor: 'rgba(249, 115, 22, 0.8)',
        radius: 6,
        stages: [
          { x: 0.80, y: 0.65, alpha: 0.3 },
          { x: 0.68, y: 0.60, alpha: 0.85 },
          { x: 0.58, y: 0.54, alpha: 0.95 },
          { x: 0.54, y: 0.52, alpha: 0.85 },
          { x: 0.66, y: 0.50, alpha: 1.0 }, // Escalation conduit
        ],
      },
      // Target Asset Node
      {
        id: 'target_db',
        label: '10.0.0.50',
        sublabel: 'PROD DATABASE',
        type: 'target',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.8)',
        radius: 7,
        stages: [
          { x: 0.88, y: 0.25, alpha: 0.3 },
          { x: 0.82, y: 0.38, alpha: 0.6 },
          { x: 0.75, y: 0.48, alpha: 0.9 },
          { x: 0.58, y: 0.53, alpha: 0.85 },
          { x: 0.86, y: 0.50, alpha: 1.0, scale: 1.2 }, // Exfiltration target on right
        ],
      },
      // Central Incident Node (The Converging Centerpiece)
      {
        id: 'central_incident',
        label: 'INCIDENT 85/100',
        sublabel: 'CRITICAL INTRUSION',
        type: 'incident',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.9)',
        radius: 12,
        stages: [
          { x: 0.50, y: 0.50, alpha: 0.05, scale: 0.2 }, // Dormant in Stage 1
          { x: 0.50, y: 0.50, alpha: 0.2, scale: 0.5 }, // Faint emergence
          { x: 0.50, y: 0.50, alpha: 0.6, scale: 0.8 }, // Gathering mass
          { x: 0.50, y: 0.50, alpha: 1.0, scale: 1.6 }, // Stage 4: Massive Convergence
          { x: 0.50, y: 0.18, alpha: 0.8, scale: 0.9 }, // Stage 5: Floats above reconstructed chain
        ],
      },
      // Additional Telemetry Cluster Anchors
      {
        id: 'fw_cluster_1',
        label: 'FIREWALL DROP',
        type: 'normal',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        radius: 4.5,
        stages: [
          { x: 0.18, y: 0.48, alpha: 0.6 },
          { x: 0.22, y: 0.42, alpha: 0.7 },
          { x: 0.26, y: 0.42, alpha: 0.7 },
          { x: 0.36, y: 0.46, alpha: 0.4 },
          { x: 0.20, y: 0.22, alpha: 0.5 },
        ],
      },
      {
        id: 'ssh_cluster_1',
        label: 'AUTH DAEMON',
        type: 'normal',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
        radius: 4.5,
        stages: [
          { x: 0.45, y: 0.20, alpha: 0.6 },
          { x: 0.42, y: 0.28, alpha: 0.7 },
          { x: 0.40, y: 0.38, alpha: 0.7 },
          { x: 0.46, y: 0.46, alpha: 0.4 },
          { x: 0.38, y: 0.68, alpha: 0.5 },
        ],
      },
      {
        id: 'vpn_cluster_1',
        label: 'VPN GATEWAY',
        type: 'normal',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        radius: 4.5,
        stages: [
          { x: 0.65, y: 0.18, alpha: 0.6 },
          { x: 0.60, y: 0.25, alpha: 0.7 },
          { x: 0.58, y: 0.38, alpha: 0.6 },
          { x: 0.52, y: 0.46, alpha: 0.4 },
          { x: 0.56, y: 0.32, alpha: 0.5 },
        ],
      },
      {
        id: 'web_cluster_1',
        label: 'NGINX PROXY',
        type: 'normal',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
        radius: 4.5,
        stages: [
          { x: 0.35, y: 0.78, alpha: 0.6 },
          { x: 0.40, y: 0.70, alpha: 0.6 },
          { x: 0.46, y: 0.62, alpha: 0.6 },
          { x: 0.48, y: 0.54, alpha: 0.4 },
          { x: 0.56, y: 0.68, alpha: 0.5 },
        ],
      },
      {
        id: 'db_replica_1',
        label: 'DB REPLICA',
        type: 'normal',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        radius: 4.5,
        stages: [
          { x: 0.85, y: 0.75, alpha: 0.6 },
          { x: 0.78, y: 0.68, alpha: 0.6 },
          { x: 0.72, y: 0.60, alpha: 0.6 },
          { x: 0.56, y: 0.54, alpha: 0.4 },
          { x: 0.78, y: 0.68, alpha: 0.5 },
        ],
      },
    ];

    // 2. EDGES BETWEEN FOREGROUND NODES (Active at specific stages)
    const edges: EdgeConnection[] = [
      // Early detection connections (Stage 2)
      { from: 'attacker_ip', to: 'port_scan', appearAt: 0.18, fullAt: 0.30, color: '#f59e0b', isAttackPath: true },
      { from: 'attacker_ip', to: 'brute_force', appearAt: 0.20, fullAt: 0.32, color: '#ef4444', isAttackPath: true },
      { from: 'attacker_ip', to: 'fw_cluster_1', appearAt: 0.15, fullAt: 0.25, color: '#10b981' },
      { from: 'port_scan', to: 'fw_cluster_1', appearAt: 0.20, fullAt: 0.30, color: '#f59e0b' },

      // Correlation connections (Stage 3)
      { from: 'brute_force', to: 'user_admin', appearAt: 0.35, fullAt: 0.48, color: '#ef4444', isAttackPath: true },
      { from: 'port_scan', to: 'user_admin', appearAt: 0.38, fullAt: 0.50, color: '#f59e0b', isAttackPath: true },
      { from: 'ssh_cluster_1', to: 'user_admin', appearAt: 0.35, fullAt: 0.48, color: '#06b6d4' },
      { from: 'vpn_cluster_1', to: 'user_admin', appearAt: 0.38, fullAt: 0.50, color: '#10b981' },
      { from: 'user_admin', to: 'priv_esc', appearAt: 0.40, fullAt: 0.52, color: '#f97316', isAttackPath: true },
      { from: 'priv_esc', to: 'target_db', appearAt: 0.42, fullAt: 0.55, color: '#ef4444', isAttackPath: true },

      // Incident convergence connections (Stage 4)
      { from: 'attacker_ip', to: 'central_incident', appearAt: 0.55, fullAt: 0.70, color: '#ef4444' },
      { from: 'port_scan', to: 'central_incident', appearAt: 0.55, fullAt: 0.70, color: '#f59e0b' },
      { from: 'brute_force', to: 'central_incident', appearAt: 0.55, fullAt: 0.70, color: '#ef4444' },
      { from: 'user_admin', to: 'central_incident', appearAt: 0.55, fullAt: 0.70, color: '#06b6d4' },
      { from: 'priv_esc', to: 'central_incident', appearAt: 0.55, fullAt: 0.70, color: '#f97316' },
      { from: 'target_db', to: 'central_incident', appearAt: 0.55, fullAt: 0.70, color: '#10b981' },

      // Stage 5 Reconstructed Attack Topology Branching Edges
      { from: 'attacker_ip', to: 'port_scan', appearAt: 0.75, fullAt: 0.85, color: '#f59e0b', isAttackPath: true },
      { from: 'attacker_ip', to: 'brute_force', appearAt: 0.75, fullAt: 0.85, color: '#ef4444', isAttackPath: true },
      { from: 'port_scan', to: 'user_admin', appearAt: 0.78, fullAt: 0.88, color: '#f59e0b', isAttackPath: true },
      { from: 'brute_force', to: 'user_admin', appearAt: 0.78, fullAt: 0.88, color: '#ef4444', isAttackPath: true },
      { from: 'user_admin', to: 'priv_esc', appearAt: 0.80, fullAt: 0.90, color: '#f97316', isAttackPath: true },
      { from: 'priv_esc', to: 'target_db', appearAt: 0.82, fullAt: 0.92, color: '#10b981', isAttackPath: true },
      { from: 'target_db', to: 'db_replica_1', appearAt: 0.85, fullAt: 0.95, color: '#10b981' },
      { from: 'user_admin', to: 'central_incident', appearAt: 0.80, fullAt: 0.90, color: '#ef4444' },
    ];

    // 3. BACKGROUND NOISE NODES (The vast sea of security telemetry)
    const bgNodes: BgNode[] = [];
    const bgNodeCount = window.innerWidth < 768 ? 200 : 480;

    const initBgNodes = (w: number, h: number) => {
      bgNodes.length = 0;
      for (let i = 0; i < bgNodeCount; i++) {
        bgNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.25),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.25),
          radius: 0.8 + Math.random() * 1.4,
          baseAlpha: 0.10 + Math.random() * 0.22,
        });
      }
    };

    // 4. MIDGROUND CLUSTERS (Representing dense server clusters & telemetry subnet webs)
    const midClusterNodes: MidClusterNode[] = [];
    const clusterCount = 12;
    for (let c = 0; c < clusterCount; c++) {
      const clusterColors = ['#10b981', '#06b6d4', '#059669', '#0891b2', '#f59e0b'];
      const color = clusterColors[c % clusterColors.length];
      const countInCluster = 10 + Math.floor(Math.random() * 8);

      for (let i = 0; i < countInCluster; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 55;
        midClusterNodes.push({
          clusterId: c,
          offsetX: Math.cos(angle) * dist,
          offsetY: Math.sin(angle) * dist,
          radius: 1.5 + Math.random() * 1.5,
          color,
        });
      }
    }

    // 5. DATA PULSES (Flowing along attack paths)
    const pulses: DataPulse[] = [];
    for (let i = 0; i < 28; i++) {
      pulses.push({
        edgeIndex: i % edges.length,
        t: Math.random(),
        speed: 0.006 + Math.random() * 0.012,
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initBgNodes(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Easing helper
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // RENDER LOOP
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current;
      const mouse = mouseRef.current;

      // Calculate stage index and subprogress
      // 5 stages: intervals [0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0]
      const clampedP = Math.max(0, Math.min(0.999, p));
      const rawStage = clampedP * 4;
      const stageIdx = Math.floor(rawStage);
      const subT = easeInOutCubic(rawStage - stageIdx);

      // --- LAYER 1: BACKGROUND NOISE (Recedes as incident forms) ---
      const bgOpacityMultiplier = Math.max(0.18, 1 - p * 0.75);

      ctx.fillStyle = '#030706';
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.03 * bgOpacityMultiplier})`;
      ctx.lineWidth = 1;
      const gridStep = 48;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw background noise dots
      for (let i = 0; i < bgNodes.length; i++) {
        const bg = bgNodes[i];
        if (!prefersReducedMotion) {
          bg.x += bg.vx;
          bg.y += bg.vy;
          if (bg.x < 0) bg.x = width;
          else if (bg.x > width) bg.x = 0;
          if (bg.y < 0) bg.y = height;
          else if (bg.y > height) bg.y = 0;
        }

        ctx.beginPath();
        ctx.arc(bg.x, bg.y, bg.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${bg.baseAlpha * bgOpacityMultiplier})`;
        ctx.fill();
      }

      // Subtle random connections between close background nodes
      const maxBgDist = 55;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < Math.min(bgNodes.length, 120); i++) {
        const n1 = bgNodes[i];
        for (let j = i + 1; j < Math.min(bgNodes.length, 120); j++) {
          const n2 = bgNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxBgDist * maxBgDist) {
            const alpha = (1 - Math.sqrt(distSq) / maxBgDist) * 0.12 * bgOpacityMultiplier;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // --- LAYER 2: INTERPOLATE FOREGROUND NODE POSITIONS ---
      const computedPos: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};

      for (let i = 0; i < fgNodes.length; i++) {
        const node = fgNodes[i];
        const s1 = node.stages[stageIdx];
        const s2 = node.stages[Math.min(stageIdx + 1, 4)];

        const targetX = lerp(s1.x, s2.x, subT) * width;
        const targetY = lerp(s1.y, s2.y, subT) * height;
        const targetAlpha = lerp(s1.alpha, s2.alpha, subT);
        const targetScale = lerp(s1.scale || 1.0, s2.scale || 1.0, subT);

        // Add subtle mouse hover attraction
        let finalX = targetX;
        let finalY = targetY;

        if (mouse.active) {
          const mdx = targetX - mouse.x;
          const mdy = targetY - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 160 && mDist > 0) {
            const pull = (160 - mDist) / 160;
            finalX += (mdx / mDist) * pull * 14;
            finalY += (mdy / mDist) * pull * 14;
          }
        }

        computedPos[node.id] = {
          x: finalX,
          y: finalY,
          alpha: targetAlpha,
          scale: targetScale,
        };
      }

      // --- LAYER 3: MIDGROUND CLUSTERS ANCHORED AROUND FG NODES ---
      for (let i = 0; i < midClusterNodes.length; i++) {
        const mc = midClusterNodes[i];
        const anchorFg = fgNodes[mc.clusterId % fgNodes.length];
        const anchorPos = computedPos[anchorFg.id];
        if (!anchorPos) continue;

        // Cluster spreads out in stage 1, compresses in stages 3-4
        const clusterSpread = lerp(1.3, 0.65, Math.min(p * 1.5, 1.0));
        const mcX = anchorPos.x + mc.offsetX * clusterSpread;
        const mcY = anchorPos.y + mc.offsetY * clusterSpread;

        // Draw line from anchor to cluster dot
        ctx.beginPath();
        ctx.moveTo(anchorPos.x, anchorPos.y);
        ctx.lineTo(mcX, mcY);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.14 * anchorPos.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Draw dot
        ctx.beginPath();
        ctx.arc(mcX, mcY, mc.radius, 0, Math.PI * 2);
        ctx.fillStyle = mc.color;
        ctx.globalAlpha = 0.45 * anchorPos.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // --- LAYER 4: DRAW CONNECTING EDGES BETWEEN FOREGROUND NODES ---
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = computedPos[edge.from];
        const p2 = computedPos[edge.to];
        if (!p1 || !p2) continue;

        // Calculate edge visibility based on scroll progress
        let edgeAlpha = 0;
        if (p >= edge.fullAt) {
          edgeAlpha = 1.0;
        } else if (p > edge.appearAt) {
          edgeAlpha = (p - edge.appearAt) / (edge.fullAt - edge.appearAt);
        }

        if (edgeAlpha <= 0.01) continue;

        const combinedAlpha = edgeAlpha * Math.min(p1.alpha, p2.alpha);
        const strokeColor = edge.color || '#10b981';

        // Mouse brightening effect on lines
        let mouseBoost = 1.0;
        if (mouse.active) {
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const md = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
          if (md < 110) mouseBoost = 1.8;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = strokeColor;
        ctx.globalAlpha = Math.min(1.0, combinedAlpha * (edge.isAttackPath ? 0.75 : 0.4) * mouseBoost);
        ctx.lineWidth = edge.isAttackPath ? 2.0 : 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // --- LAYER 5: DATA PACKET PULSES FLOWING ALONG ATTACK EDGES ---
      if (!prefersReducedMotion) {
        for (let i = 0; i < pulses.length; i++) {
          const pulse = pulses[i];
          const edge = edges[pulse.edgeIndex];
          if (!edge) continue;

          // Pulse moves along edge
          pulse.t += pulse.speed;
          if (pulse.t > 1.0) pulse.t = 0.0;

          // Only render pulse if edge is active
          if (p < edge.appearAt + 0.05) continue;

          const p1 = computedPos[edge.from];
          const p2 = computedPos[edge.to];
          if (!p1 || !p2) continue;

          const px = lerp(p1.x, p2.x, pulse.t);
          const py = lerp(p1.y, p2.y, pulse.t);

          ctx.beginPath();
          ctx.arc(px, py, edge.isAttackPath ? 3.0 : 2.0, 0, Math.PI * 2);
          ctx.fillStyle = edge.color || '#10b981';
          ctx.shadowColor = edge.color || '#10b981';
          ctx.shadowBlur = 8;
          ctx.globalAlpha = 0.9;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      }

      // --- LAYER 6: RENDER FOREGROUND NODES & LABELS ---
      for (let i = 0; i < fgNodes.length; i++) {
        const node = fgNodes[i];
        const cp = computedPos[node.id];
        if (!cp || cp.alpha <= 0.02) continue;

        const effectiveRadius = node.radius * cp.scale;

        // Incident Core Pulsing Concentric Energy Rings in Stage 4
        if (node.type === 'incident') {
          const incidentStageStrength = Math.max(0, 1 - Math.abs(p - 0.70) * 4); // Peak around 0.70
          if (incidentStageStrength > 0.05) {
            const time = Date.now() * 0.003;
            for (let ring = 1; ring <= 3; ring++) {
              const ringRadius = effectiveRadius * (1.8 + ring * 0.8 + Math.sin(time + ring) * 0.25);
              ctx.beginPath();
              ctx.arc(cp.x, cp.y, ringRadius, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 * incidentStageStrength * (1 / ring)})`;
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }

        // Outer Glow
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, effectiveRadius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = node.glowColor;
        ctx.globalAlpha = 0.3 * cp.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Core Node
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12 * cp.alpha;
        ctx.globalAlpha = cp.alpha;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // Node Labels (Only visible when node is active & alpha > 0.5)
        if (cp.alpha > 0.55 && (p > 0.15 || node.type === 'attacker' || node.type === 'user')) {
          ctx.save();
          ctx.globalAlpha = Math.min(1.0, (cp.alpha - 0.5) * 2);

          // Sublabel (Type badge)
          if (node.sublabel) {
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = node.color;
            ctx.textAlign = 'center';
            ctx.fillText(node.sublabel.toUpperCase(), cp.x, cp.y - effectiveRadius - 12);
          }

          // Main Label
          ctx.font = node.type === 'incident' ? 'bold 13px "JetBrains Mono", monospace' : 'bold 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, cp.x, cp.y + effectiveRadius + 15);

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ background: '#030706' }}
    />
  );
};
