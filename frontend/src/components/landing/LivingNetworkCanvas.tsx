import React, { useEffect, useRef } from 'react';

interface LivingNetworkCanvasProps {
  className?: string;
}

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  isHub: boolean;
  label?: string;
  hubType?: 'threat' | 'target' | 'telemetry' | 'normal';
}

interface Edge {
  source: number;
  target: number;
  distance: number;
  color: string;
  isThreat: boolean;
}

interface Packet {
  edgeIndex: number;
  progress: number;
  speed: number;
  color: string;
}

export const LivingNetworkCanvas: React.FC<LivingNetworkCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nodes: GraphNode[] = [];
    const edges: Edge[] = [];
    const packets: Packet[] = [];

    const initNetwork = (w: number, h: number) => {
      nodes.length = 0;
      edges.length = 0;
      packets.length = 0;

      const isMobile = w < 768;
      const nodeCount = isMobile ? 120 : 280;

      // 1. Generate Hubs (Key security pivots)
      const hubs = [
        { x: 0.18, y: 0.35, color: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)', label: 'INGRESS 185.23.91.44', type: 'threat' as const },
        { x: 0.32, y: 0.65, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', label: 'PORT SCAN RECON', type: 'threat' as const },
        { x: 0.48, y: 0.45, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.8)', label: 'AUTH admin', type: 'telemetry' as const },
        { x: 0.68, y: 0.35, color: '#f97316', glow: 'rgba(249, 115, 22, 0.8)', label: 'PRIV_ESC T1068', type: 'threat' as const },
        { x: 0.82, y: 0.55, color: '#10b981', glow: 'rgba(16, 185, 129, 0.8)', label: 'DB 10.0.0.50', type: 'target' as const },
        { x: 0.50, y: 0.75, color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', label: 'GATEWAY', type: 'telemetry' as const },
      ];

      for (let i = 0; i < hubs.length; i++) {
        const hub = hubs[i];
        nodes.push({
          x: hub.x * w,
          y: hub.y * h,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.2),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.2),
          radius: 5.5,
          color: hub.color,
          glowColor: hub.glow,
          isHub: true,
          label: hub.label,
          hubType: hub.type,
        });
      }

      // 2. Generate Dense Network Nodes clustered around hubs & throughout background
      for (let i = hubs.length; i < nodeCount; i++) {
        const nearHub = Math.random() < 0.6;
        let x = Math.random() * w;
        let y = Math.random() * h;

        if (nearHub) {
          const targetHub = hubs[Math.floor(Math.random() * hubs.length)];
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 140;
          x = targetHub.x * w + Math.cos(angle) * dist;
          y = targetHub.y * h + Math.sin(angle) * dist;
        }

        const isSuspicious = Math.random() < 0.12;
        const color = isSuspicious ? '#f59e0b' : Math.random() < 0.5 ? '#10b981' : '#06b6d4';
        const glow = isSuspicious ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.4)';

        nodes.push({
          x: Math.max(10, Math.min(w - 10, x)),
          y: Math.max(10, Math.min(h - 10, y)),
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.35),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.35),
          radius: 1.5 + Math.random() * 2.0,
          color,
          glowColor: glow,
          isHub: false,
        });
      }

      // 3. Connect Nodes into Dense Web Edges
      const maxConnectDist = isMobile ? 85 : 120;
      const maxEdgesPerNode = 4;

      for (let i = 0; i < nodes.length; i++) {
        let connectedCount = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (connectedCount >= maxEdgesPerNode) break;

          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const isThreat = n1.color === '#ef4444' || n2.color === '#ef4444' || n1.color === '#f59e0b';
            const edgeColor = isThreat ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.25)';

            edges.push({
              source: i,
              target: j,
              distance: dist,
              color: edgeColor,
              isThreat,
            });
            connectedCount++;
          }
        }
      }

      // 4. Create Flowing Packets along edges
      for (let i = 0; i < Math.min(edges.length, 45); i++) {
        packets.push({
          edgeIndex: Math.floor(Math.random() * edges.length),
          progress: Math.random(),
          speed: 0.005 + Math.random() * 0.012,
          color: Math.random() < 0.3 ? '#ef4444' : '#10b981',
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
      initNetwork(width, height);
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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Deep cyber background
      ctx.fillStyle = '#030706';
      ctx.fillRect(0, 0, width, height);

      // Cyber Matrix Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.035)';
      ctx.lineWidth = 1;
      const step = 56;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update Node Positions
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 15) { node.x = 15; node.vx *= -1; }
          else if (node.x > width - 15) { node.x = width - 15; node.vx *= -1; }
          if (node.y < 15) { node.y = 15; node.vy *= -1; }
          else if (node.y > height - 15) { node.y = height - 15; node.vy *= -1; }
        }

        // Mouse proximity interaction
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const force = (140 - dist) / 140;
            node.x += (dx / dist) * force * 1.5;
            node.y += (dy / dist) * force * 1.5;
          }
        }
      }

      // Draw Edges (Spider-web density)
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const n1 = nodes[edge.source];
        const n2 = nodes[edge.target];
        if (!n1 || !n2) continue;

        let alphaFactor = 1.0;
        if (mouse.active) {
          const midX = (n1.x + n2.x) / 2;
          const midY = (n1.y + n2.y) / 2;
          const mDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
          if (mDist < 120) alphaFactor = 2.4;
        }

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = edge.color;
        ctx.globalAlpha = Math.min(1.0, (edge.isThreat ? 0.45 : 0.22) * alphaFactor);
        ctx.lineWidth = edge.isThreat ? 1.6 : 1.0;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Draw Data Packets along edges
      if (!prefersReducedMotion) {
        for (let i = 0; i < packets.length; i++) {
          const pkt = packets[i];
          const edge = edges[pkt.edgeIndex];
          if (!edge) continue;

          pkt.progress += pkt.speed;
          if (pkt.progress > 1.0) pkt.progress = 0;

          const n1 = nodes[edge.source];
          const n2 = nodes[edge.target];
          if (!n1 || !n2) continue;

          const px = n1.x + (n2.x - n1.x) * pkt.progress;
          const py = n1.y + (n2.y - n1.y) * pkt.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = pkt.color;
          ctx.shadowColor = pkt.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Glow halo
        if (node.isHub || node.color === '#f59e0b') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = node.glowColor;
          ctx.fill();
        }

        // Center dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.isHub ? 12 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hub labels
        if (node.isHub && node.label && width > 640) {
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.radius + 14);
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
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ background: '#030706' }}
    />
  );
};
