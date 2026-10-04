import React, { useEffect, useRef } from 'react';

interface NeonGalaxyNetworkCanvasProps {
  progress?: number; // 0.0 to 1.0 (if in scroll mode)
  stage?: number; // 1 to 5
  interactive?: boolean;
  className?: string;
  showHorizon?: boolean;
}

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  depth: number; // 1 (far), 2 (mid), 3 (foreground)
}

interface WebNode {
  id: string;
  cluster: 'raw' | 'threat' | 'correlation' | 'incident' | 'target' | 'scatter';
  label?: string;
  sublabel?: string;
  baseRadius: number;
  color: string;
  glowColor: string;
  isKeyNode: boolean;
  // Normalized base position (0.0 to 1.0)
  x: number;
  y: number;
  // Current interpolated canvas positions
  currX: number;
  currY: number;
  // Stage coordinates (1 to 5)
  stageCoords: Array<{ x: number; y: number; alpha: number; scale?: number }>;
}

interface WebEdge {
  sourceId: string;
  targetId: string;
  sourceIdx: number;
  targetIdx: number;
  color: string;
  baseAlpha: number;
  width: number;
  isCurved?: boolean;
  curveOffset?: number;
  appearStage: number; // 1 to 5
  isAttackTrunk?: boolean;
}

interface PhotonPacket {
  edgeIdx: number;
  t: number;
  speed: number;
  color: string;
  size: number;
}

export const NeonGalaxyNetworkCanvas: React.FC<NeonGalaxyNetworkCanvasProps> = ({
  progress = 0,
  stage = 1,
  interactive = true,
  className = '',
  showHorizon = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -2000,
    y: -2000,
    active: false,
  });

  const progressRef = useRef(progress);
  progressRef.current = progress;

  const stageRef = useRef(stage);
  stageRef.current = stage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. STAR GALAXY PARTICLES (1,000+ telemetry dust particles across 3 depth planes)
    const stars: StarParticle[] = [];
    const initGalaxy = (w: number, h: number) => {
      stars.length = 0;
      const count = w < 768 ? 450 : 1100;

      for (let i = 0; i < count; i++) {
        const depth = Math.random() < 0.65 ? 1 : Math.random() < 0.85 ? 2 : 3;
        const randColor = Math.random();
        let color = '#00FF9C'; // Neon Green
        if (randColor < 0.40) color = '#00FF9C'; // Neon green
        else if (randColor < 0.70) color = '#00D9FF'; // Cyan
        else if (randColor < 0.88) color = '#ffffff'; // Starlight white
        else if (randColor < 0.95) color = '#FF8A24'; // Distant threat orange
        else color = '#FF3B45'; // Distant critical red

        const baseAlpha = depth === 1 ? 0.15 + Math.random() * 0.25 : depth === 2 ? 0.35 + Math.random() * 0.35 : 0.6 + Math.random() * 0.35;
        const radius = depth === 1 ? 0.6 + Math.random() * 0.6 : depth === 2 ? 1.0 + Math.random() * 0.9 : 1.8 + Math.random() * 1.4;

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius,
          color,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          twinklePhase: Math.random() * Math.PI * 2,
          depth,
        });
      }
    };

    // 2. THE DENSE NEURAL / SPIDER-WEB NODES
    const nodes: WebNode[] = [];
    const edges: WebEdge[] = [];
    const packets: PhotonPacket[] = [];

    const initNetwork = (w: number, h: number) => {
      nodes.length = 0;
      edges.length = 0;
      packets.length = 0;

      // KEY ANCHOR NODES (From Image 1)
      const keyAnchors: Array<{
        id: string;
        cluster: WebNode['cluster'];
        label: string;
        sublabel?: string;
        color: string;
        glow: string;
        radius: number;
        coords: Array<{ x: number; y: number; alpha: number; scale?: number }>;
      }> = [
        // Left Cluster: Raw Telemetry Core
        {
          id: 'raw_core',
          cluster: 'raw',
          label: 'RAW TELEMETRY',
          sublabel: 'Security Logs',
          color: '#00FF9C',
          glow: 'rgba(0, 255, 156, 0.9)',
          radius: 9,
          coords: [
            { x: 0.14, y: 0.36, alpha: 1.0, scale: 1.2 },
            { x: 0.14, y: 0.36, alpha: 0.8 },
            { x: 0.14, y: 0.38, alpha: 0.7 },
            { x: 0.20, y: 0.45, alpha: 0.4 },
            { x: 0.12, y: 0.38, alpha: 0.8 },
          ],
        },
        // Threat 1: Brute Force
        {
          id: 'threat_bruteforce',
          cluster: 'threat',
          label: 'Brute Force',
          sublabel: 'T1110 6 Failures',
          color: '#FF3B45',
          glow: 'rgba(255, 59, 69, 0.9)',
          radius: 8,
          coords: [
            { x: 0.32, y: 0.28, alpha: 0.6 },
            { x: 0.32, y: 0.28, alpha: 1.0, scale: 1.3 },
            { x: 0.30, y: 0.32, alpha: 0.9 },
            { x: 0.42, y: 0.46, alpha: 0.5 },
            { x: 0.28, y: 0.30, alpha: 1.0 },
          ],
        },
        // Threat 2: Port Scan
        {
          id: 'threat_portscan',
          cluster: 'threat',
          label: 'Port Scan',
          sublabel: 'T1595 Recon',
          color: '#FF8A24',
          glow: 'rgba(255, 138, 36, 0.9)',
          radius: 7.5,
          coords: [
            { x: 0.36, y: 0.44, alpha: 0.5 },
            { x: 0.36, y: 0.44, alpha: 1.0, scale: 1.25 },
            { x: 0.34, y: 0.42, alpha: 0.9 },
            { x: 0.44, y: 0.48, alpha: 0.5 },
            { x: 0.32, y: 0.46, alpha: 1.0 },
          ],
        },
        // Threat 3: Suspicious Login
        {
          id: 'threat_login',
          cluster: 'threat',
          label: 'Suspicious Login',
          sublabel: 'T1078 Multi-IP',
          color: '#FF8A24',
          glow: 'rgba(255, 138, 36, 0.9)',
          radius: 7,
          coords: [
            { x: 0.35, y: 0.62, alpha: 0.5 },
            { x: 0.35, y: 0.62, alpha: 1.0, scale: 1.2 },
            { x: 0.33, y: 0.58, alpha: 0.9 },
            { x: 0.44, y: 0.52, alpha: 0.5 },
            { x: 0.30, y: 0.62, alpha: 1.0 },
          ],
        },
        // Threat 4: Privilege Escalation
        {
          id: 'threat_privesc',
          cluster: 'threat',
          label: 'Privilege Escalation',
          sublabel: 'T1068 sudo /etc/shadow',
          color: '#FF3B45',
          glow: 'rgba(255, 59, 69, 0.9)',
          radius: 8,
          coords: [
            { x: 0.30, y: 0.74, alpha: 0.5 },
            { x: 0.30, y: 0.74, alpha: 1.0, scale: 1.3 },
            { x: 0.32, y: 0.68, alpha: 0.9 },
            { x: 0.45, y: 0.54, alpha: 0.5 },
            { x: 0.28, y: 0.74, alpha: 1.0 },
          ],
        },
        // Center Cluster: Correlation Sphere / User Activity
        {
          id: 'corr_user_act',
          cluster: 'correlation',
          label: 'User Activity',
          sublabel: 'Temporal Sliding Window',
          color: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.9)',
          radius: 8.5,
          coords: [
            { x: 0.46, y: 0.44, alpha: 0.5 },
            { x: 0.46, y: 0.44, alpha: 0.7 },
            { x: 0.46, y: 0.44, alpha: 1.0, scale: 1.3 },
            { x: 0.48, y: 0.48, alpha: 0.8 },
            { x: 0.44, y: 0.46, alpha: 0.9 },
          ],
        },
        // Center Cluster: Shared IPs & Entity Linking
        {
          id: 'corr_shared_ip',
          cluster: 'correlation',
          label: 'Shared IPs',
          sublabel: 'Entity Pivot',
          color: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.8)',
          radius: 7.5,
          coords: [
            { x: 0.52, y: 0.30, alpha: 0.5 },
            { x: 0.52, y: 0.30, alpha: 0.7 },
            { x: 0.52, y: 0.30, alpha: 1.0, scale: 1.2 },
            { x: 0.49, y: 0.46, alpha: 0.8 },
            { x: 0.50, y: 0.32, alpha: 0.9 },
          ],
        },
        {
          id: 'corr_linking',
          cluster: 'correlation',
          label: 'Entity Linking',
          sublabel: 'Causal Graph',
          color: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.8)',
          radius: 7.5,
          coords: [
            { x: 0.48, y: 0.64, alpha: 0.5 },
            { x: 0.48, y: 0.64, alpha: 0.7 },
            { x: 0.48, y: 0.64, alpha: 1.0, scale: 1.2 },
            { x: 0.50, y: 0.54, alpha: 0.8 },
            { x: 0.48, y: 0.62, alpha: 0.9 },
          ],
        },
        {
          id: 'corr_mitre',
          cluster: 'correlation',
          label: 'MITRE Chain',
          sublabel: 'Kill-Chain Alignment',
          color: '#00FF9C',
          glow: 'rgba(0, 255, 156, 0.8)',
          radius: 7,
          coords: [
            { x: 0.55, y: 0.52, alpha: 0.5 },
            { x: 0.55, y: 0.52, alpha: 0.7 },
            { x: 0.55, y: 0.52, alpha: 1.0, scale: 1.2 },
            { x: 0.52, y: 0.50, alpha: 0.8 },
            { x: 0.54, y: 0.50, alpha: 0.9 },
          ],
        },
        // Central Pulsing Incident (The Crown Jewel of the Collage)
        {
          id: 'incident_core',
          cluster: 'incident',
          label: 'INCIDENT',
          sublabel: 'Risk Score 85/100 CRITICAL',
          color: '#FF3B45',
          glow: 'rgba(255, 59, 69, 1.0)',
          radius: 15,
          coords: [
            { x: 0.65, y: 0.48, alpha: 0.4, scale: 0.6 },
            { x: 0.65, y: 0.48, alpha: 0.6, scale: 0.8 },
            { x: 0.65, y: 0.48, alpha: 0.8, scale: 1.0 },
            { x: 0.65, y: 0.48, alpha: 1.0, scale: 1.8 }, // Massive stage 4 convergence
            { x: 0.65, y: 0.48, alpha: 1.0, scale: 1.3 }, // Reconstructed focal point
          ],
        },
        // Right Cluster: Attacker IP (Red Badge)
        {
          id: 'target_attacker',
          cluster: 'target',
          label: 'Attacker IP',
          sublabel: '185.23.91.44',
          color: '#FF3B45',
          glow: 'rgba(255, 59, 69, 0.9)',
          radius: 9,
          coords: [
            { x: 0.90, y: 0.30, alpha: 0.5 },
            { x: 0.90, y: 0.30, alpha: 0.7 },
            { x: 0.88, y: 0.32, alpha: 0.8 },
            { x: 0.76, y: 0.44, alpha: 0.6 },
            { x: 0.92, y: 0.28, alpha: 1.0, scale: 1.3 },
          ],
        },
        // Right Cluster: Compromised User admin (Cyan Badge)
        {
          id: 'target_user',
          cluster: 'target',
          label: 'Compromised User',
          sublabel: 'admin',
          color: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.9)',
          radius: 9,
          coords: [
            { x: 0.85, y: 0.45, alpha: 0.5 },
            { x: 0.85, y: 0.45, alpha: 0.7 },
            { x: 0.84, y: 0.45, alpha: 0.8 },
            { x: 0.74, y: 0.48, alpha: 0.6 },
            { x: 0.86, y: 0.46, alpha: 1.0, scale: 1.3 },
          ],
        },
        // Right Cluster: Detection Rules (Purple/White Badge)
        {
          id: 'target_rules',
          cluster: 'target',
          label: 'Detection Rules',
          sublabel: 'T1110 • T1190 • T1068',
          color: '#00E887',
          glow: 'rgba(0, 232, 135, 0.8)',
          radius: 8,
          coords: [
            { x: 0.92, y: 0.58, alpha: 0.5 },
            { x: 0.92, y: 0.58, alpha: 0.7 },
            { x: 0.90, y: 0.56, alpha: 0.8 },
            { x: 0.76, y: 0.52, alpha: 0.6 },
            { x: 0.92, y: 0.60, alpha: 1.0 },
          ],
        },
        // Right Cluster: Target Assets (Green Server Badge)
        {
          id: 'target_asset',
          cluster: 'target',
          label: 'Target Assets',
          sublabel: '192.168.1.10 (Prod)',
          color: '#00FF9C',
          glow: 'rgba(0, 255, 156, 0.9)',
          radius: 8.5,
          coords: [
            { x: 0.86, y: 0.70, alpha: 0.5 },
            { x: 0.86, y: 0.70, alpha: 0.7 },
            { x: 0.85, y: 0.68, alpha: 0.8 },
            { x: 0.75, y: 0.54, alpha: 0.6 },
            { x: 0.87, y: 0.74, alpha: 1.0, scale: 1.3 },
          ],
        },
      ];

      // Add Key Anchors to Nodes
      keyAnchors.forEach((ka) => {
        const c0 = ka.coords[0];
        nodes.push({
          id: ka.id,
          cluster: ka.cluster,
          label: ka.label,
          sublabel: ka.sublabel,
          baseRadius: ka.radius,
          color: ka.color,
          glowColor: ka.glow,
          isKeyNode: true,
          x: c0.x,
          y: c0.y,
          currX: c0.x * w,
          currY: c0.y * h,
          stageCoords: ka.coords,
        });
      });

      // 3. GENERATE DENSE SPIDER-WEB CLUSTER NETWORKS (350+ nodes tightly woven around anchors)
      const isMobile = w < 768;
      const satelliteCount = isMobile ? 140 : 360;

      for (let i = 0; i < satelliteCount; i++) {
        // Pick an anchor to orbit
        const anchor = keyAnchors[Math.floor(Math.random() * keyAnchors.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 95;

        const anchorNormX = anchor.coords[0].x;
        const anchorNormY = anchor.coords[0].y;
        const normDistX = dist / w;
        const normDistY = dist / h;

        const colorPalette = [anchor.color, '#00FF9C', '#00D9FF', '#00E887'];
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        const stagesForSatellite = anchor.coords.map((c) => ({
          x: Math.max(0.02, Math.min(0.98, c.x + Math.cos(angle) * normDistX)),
          y: Math.max(0.05, Math.min(0.95, c.y + Math.sin(angle) * normDistY)),
          alpha: c.alpha * (0.35 + Math.random() * 0.45),
        }));

        nodes.push({
          id: `sat_${anchor.id}_${i}`,
          cluster: anchor.cluster,
          baseRadius: 1.5 + Math.random() * 2.2,
          color,
          glowColor: color === '#FF3B45' ? 'rgba(255, 59, 69, 0.6)' : 'rgba(0, 255, 156, 0.5)',
          isKeyNode: false,
          x: anchorNormX + Math.cos(angle) * normDistX,
          y: anchorNormY + Math.sin(angle) * normDistY,
          currX: (anchorNormX + Math.cos(angle) * normDistX) * w,
          currY: (anchorNormY + Math.sin(angle) * normDistY) * h,
          stageCoords: stagesForSatellite,
        });
      }

      // 4. GENERATE 1,000+ VISIBLE SPIDER-WEB EDGES
      // Connect anchors to each other into the signature Attack Trunk
      const trunkConnections = [
        ['raw_core', 'threat_bruteforce', '#FF3B45', 2.0, 1],
        ['raw_core', 'threat_portscan', '#FF8A24', 1.8, 1],
        ['raw_core', 'threat_login', '#FF8A24', 1.8, 1],
        ['raw_core', 'threat_privesc', '#FF3B45', 2.0, 1],
        ['threat_bruteforce', 'corr_user_act', '#00D9FF', 2.0, 2],
        ['threat_portscan', 'corr_user_act', '#00D9FF', 1.8, 2],
        ['threat_login', 'corr_shared_ip', '#00D9FF', 1.8, 2],
        ['threat_privesc', 'corr_linking', '#FF3B45', 2.0, 2],
        ['corr_user_act', 'corr_mitre', '#00FF9C', 2.2, 3],
        ['corr_shared_ip', 'corr_mitre', '#00FF9C', 2.0, 3],
        ['corr_linking', 'corr_mitre', '#00FF9C', 2.0, 3],
        ['corr_mitre', 'incident_core', '#FF3B45', 3.0, 3],
        ['incident_core', 'target_attacker', '#FF3B45', 2.5, 4],
        ['incident_core', 'target_user', '#00D9FF', 2.5, 4],
        ['incident_core', 'target_rules', '#00E887', 2.0, 4],
        ['incident_core', 'target_asset', '#00FF9C', 2.5, 4],
        ['target_attacker', 'target_user', '#FF3B45', 2.0, 5],
        ['target_user', 'target_rules', '#00D9FF', 2.0, 5],
        ['target_rules', 'target_asset', '#00FF9C', 2.0, 5],
      ] as const;

      trunkConnections.forEach(([sId, tId, col, wgt, appStage]) => {
        const sIdx = nodes.findIndex((n) => n.id === sId);
        const tIdx = nodes.findIndex((n) => n.id === tId);
        if (sIdx !== -1 && tIdx !== -1) {
          edges.push({
            sourceId: sId,
            targetId: tId,
            sourceIdx: sIdx,
            targetIdx: tIdx,
            color: col,
            baseAlpha: 0.85,
            width: wgt,
            appearStage: appStage,
            isAttackTrunk: true,
            isCurved: true,
            curveOffset: (Math.random() - 0.5) * 40,
          });
        }
      });

      // Connect satellites to their local anchors and neighboring satellites (dense web mesh)
      const connectDist = isMobile ? 85 : 120;
      for (let i = 0; i < nodes.length; i++) {
        let countForNode = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (countForNode >= 4) break;

          const n1 = nodes[i];
          const n2 = nodes[j];
          // Connect if they belong to same or adjacent clusters
          const dx = (n1.x - n2.x) * w;
          const dy = (n1.y - n2.y) * h;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const isThreatEdge = n1.color === '#FF3B45' || n2.color === '#FF3B45';
            const isOrangeEdge = n1.color === '#FF8A24' || n2.color === '#FF8A24';
            let edgeColor = 'rgba(0, 255, 156, 0.35)'; // Neon green web
            if (isThreatEdge) edgeColor = 'rgba(255, 59, 69, 0.55)';
            else if (isOrangeEdge) edgeColor = 'rgba(255, 138, 36, 0.45)';
            else if (n1.color === '#00D9FF' || n2.color === '#00D9FF') edgeColor = 'rgba(0, 217, 255, 0.40)';

            edges.push({
              sourceId: n1.id,
              targetId: n2.id,
              sourceIdx: i,
              targetIdx: j,
              color: edgeColor,
              baseAlpha: 0.40,
              width: 0.9,
              appearStage: 1,
            });
            countForNode++;
          }
        }
      }

      // 5. FLOWING PHOTON PACKETS (Surging along trunk lines)
      for (let i = 0; i < Math.min(edges.length, 55); i++) {
        const edge = edges[i];
        packets.push({
          edgeIdx: i,
          t: Math.random(),
          speed: edge.isAttackTrunk ? 0.008 + Math.random() * 0.012 : 0.004 + Math.random() * 0.006,
          color: edge.isAttackTrunk ? '#ffffff' : edge.color.includes('255, 59') ? '#FF3B45' : '#00FF9C',
          size: edge.isAttackTrunk ? 3.0 : 1.8,
        });
      }
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initGalaxy(width, height);
      initNetwork(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
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

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // RENDER LOOP
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current;
      const mouse = mouseRef.current;

      // Stage and subprogress calculations
      const clampedP = Math.max(0, Math.min(0.999, p));
      const rawStage = clampedP * 4; // 0 to 4
      const stageIdx = Math.floor(rawStage);
      const subT = easeInOutCubic(rawStage - stageIdx);

      // --- 1. DEEP CYBER SPACE BACKGROUND ---
      ctx.fillStyle = '#020605';
      ctx.fillRect(0, 0, width, height);

      // Cyber Matrix Grid (Subtle green cross-hatch)
      ctx.strokeStyle = 'rgba(0, 255, 156, 0.035)';
      ctx.lineWidth = 1;
      const gridSpacing = 48;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- 2. GALAXY PARTICLES LAYER (1,000+ stars drifting with twinkle and parallax) ---
      const mouseParallaxX = mouse.active ? (mouse.x - width / 2) * 0.03 : 0;
      const mouseParallaxY = mouse.active ? (mouse.y - height / 2) * 0.03 : 0;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!prefersReducedMotion) {
          s.twinklePhase += s.twinkleSpeed;
          s.alpha = s.baseAlpha * (0.65 + Math.sin(s.twinklePhase) * 0.35);
        }

        const px = s.x + mouseParallaxX * s.depth;
        const py = s.y + mouseParallaxY * s.depth;

        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // --- 3. OPTIONAL WIREFRAME HORIZON / CYBER GLOBE CURVATURE (From lower third of Image 1) ---
      if (showHorizon) {
        const horizonCenterY = height * 1.35;
        const horizonRadius = width * 0.85;

        ctx.save();
        ctx.beginPath();
        ctx.arc(width * 0.5, horizonCenterY, horizonRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 156, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Radial longitude lines
        for (let a = -0.4; a <= 0.4; a += 0.08) {
          ctx.beginPath();
          ctx.moveTo(width * 0.5 + Math.sin(a) * (horizonRadius * 0.7), horizonCenterY - Math.cos(a) * (horizonRadius * 0.7));
          ctx.lineTo(width * 0.5 + Math.sin(a) * (horizonRadius * 1.05), horizonCenterY - Math.cos(a) * (horizonRadius * 1.05));
          ctx.strokeStyle = 'rgba(0, 255, 156, 0.06)';
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- 4. INTERPOLATE NODE POSITIONS ACROSS STAGES ---
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const s1 = node.stageCoords[stageIdx] || node.stageCoords[0];
        const s2 = node.stageCoords[Math.min(stageIdx + 1, 4)] || s1;

        const targetX = lerp(s1.x, s2.x, subT) * width;
        const targetY = lerp(s1.y, s2.y, subT) * height;

        // Mouse elastic repulsion/attraction
        let fx = targetX;
        let fy = targetY;

        if (interactive && mouse.active) {
          const dx = targetX - mouse.x;
          const dy = targetY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const pull = (140 - dist) / 140;
            fx += (dx / dist) * pull * 16;
            fy += (dy / dist) * pull * 16;
          }
        }

        node.currX = fx;
        node.currY = fy;
      }

      // --- 5. DRAW DENSE SPIDER-WEB EDGES (Clearly visible, glowing, curved trunk lines) ---
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const n1 = nodes[edge.sourceIdx];
        const n2 = nodes[edge.targetIdx];
        if (!n1 || !n2) continue;

        // Stage visibility threshold
        const isTrunk = edge.isAttackTrunk;
        let edgeAlpha = edge.baseAlpha;

        if (isTrunk && p < 0.1 && edge.appearStage > 2) {
          edgeAlpha *= 0.35; // Still faintly visible as latent attack path
        }

        // Mouse brightening effect on nearby edges
        if (mouse.active) {
          const midX = (n1.currX + n2.currX) / 2;
          const midY = (n1.currY + n2.currY) / 2;
          const mDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
          if (mDist < 120) edgeAlpha = Math.min(1.0, edgeAlpha * 2.2);
        }

        ctx.save();
        ctx.beginPath();
        if (isTrunk) {
          // Curved bezier arc for signature attack channels
          const midX = (n1.currX + n2.currX) / 2;
          const midY = (n1.currY + n2.currY) / 2 + (edge.curveOffset || 0);
          ctx.moveTo(n1.currX, n1.currY);
          ctx.quadraticCurveTo(midX, midY, n2.currX, n2.currY);
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = edge.width;
          ctx.shadowColor = edge.color;
          ctx.shadowBlur = 10;
        } else {
          ctx.moveTo(n1.currX, n1.currY);
          ctx.lineTo(n2.currX, n2.currY);
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = edge.width;
        }

        ctx.globalAlpha = edgeAlpha;
        ctx.stroke();
        ctx.restore();
      }

      // --- 6. PHOTON DATA PACKETS SURGING ALONG ATTACK EDGES ---
      if (!prefersReducedMotion) {
        for (let i = 0; i < packets.length; i++) {
          const pkt = packets[i];
          const edge = edges[pkt.edgeIdx];
          if (!edge) continue;

          pkt.t += pkt.speed;
          if (pkt.t > 1.0) pkt.t = 0;

          const n1 = nodes[edge.sourceIdx];
          const n2 = nodes[edge.targetIdx];
          if (!n1 || !n2) continue;

          let px = n1.currX + (n2.currX - n1.currX) * pkt.t;
          let py = n1.currY + (n2.currY - n1.currY) * pkt.t;

          if (edge.isAttackTrunk) {
            const midX = (n1.currX + n2.currX) / 2;
            const midY = (n1.currY + n2.currY) / 2 + (edge.curveOffset || 0);
            // Quadratic bezier calculation
            const omt = 1 - pkt.t;
            px = omt * omt * n1.currX + 2 * omt * pkt.t * midX + pkt.t * pkt.t * n2.currX;
            py = omt * omt * n1.currY + 2 * omt * pkt.t * midY + pkt.t * pkt.t * n2.currY;
          }

          ctx.beginPath();
          ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
          ctx.fillStyle = pkt.color;
          ctx.shadowColor = pkt.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // --- 7. DRAW NETWORK NODES (With glowing halos and incident energy rings) ---
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const s1 = node.stageCoords[stageIdx] || node.stageCoords[0];
        const s2 = node.stageCoords[Math.min(stageIdx + 1, 4)] || s1;
        const alpha = lerp(s1.alpha, s2.alpha, subT);
        const scale = lerp(s1.scale || 1.0, s2.scale || 1.0, subT);

        const r = node.baseRadius * scale;

        // Incident Core Pulsing Concentric Energy Rings
        if (node.id === 'incident_core') {
          const time = Date.now() * 0.003;
          for (let ring = 1; ring <= 4; ring++) {
            const ringR = r * (1.6 + ring * 0.65 + Math.sin(time + ring * 0.8) * 0.2);
            ctx.beginPath();
            ctx.arc(node.currX, node.currY, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = ring % 2 === 0 ? 'rgba(255, 59, 69, 0.5)' : 'rgba(255, 138, 36, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Outer Glow Halo for Key Nodes
        if (node.isKeyNode) {
          ctx.beginPath();
          ctx.arc(node.currX, node.currY, r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = node.glowColor;
          ctx.globalAlpha = 0.35 * alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Core Dot
        ctx.beginPath();
        ctx.arc(node.currX, node.currY, r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.isKeyNode ? 14 : 5;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // Labels for Key Anchors
        if (node.isKeyNode && width > 640 && node.label) {
          ctx.save();
          ctx.globalAlpha = alpha;

          // Upper Sublabel badge
          if (node.sublabel) {
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = node.color;
            ctx.textAlign = 'center';
            ctx.fillText(node.sublabel.toUpperCase(), node.currX, node.currY - r - 10);
          }

          // Main Label
          ctx.font = node.id === 'incident_core' ? 'black 14px "JetBrains Mono", monospace' : 'bold 11px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.currX, node.currY + r + 16);

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
  }, [interactive, showHorizon]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ background: '#020605' }}
    />
  );
};

export default NeonGalaxyNetworkCanvas;
