import React, { useEffect, useRef } from 'react';

interface LivingNetworkCanvasProps {
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  alpha: number;
  type: 'normal' | 'suspicious' | 'critical' | 'cluster';
}

export const LivingNetworkCanvas: React.FC<LivingNetworkCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initNodes();
    };

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

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let nodes: Node[] = [];

    const initNodes = () => {
      nodes = [];
      const nodeCount = Math.min(Math.floor((width * height) / 12000), 160);

      const colorPalette = [
        { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', type: 'normal' as const },
        { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', type: 'normal' as const },
        { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', type: 'suspicious' as const },
        { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)', type: 'critical' as const },
        { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)', type: 'cluster' as const },
      ];

      for (let i = 0; i < nodeCount; i++) {
        const rand = Math.random();
        let selected = colorPalette[0];
        if (rand < 0.5) selected = colorPalette[0]; // Emerald
        else if (rand < 0.75) selected = colorPalette[1]; // Cyan
        else if (rand < 0.88) selected = colorPalette[2]; // Amber (suspicious)
        else if (rand < 0.95) selected = colorPalette[3]; // Red (critical)
        else selected = colorPalette[4]; // Cluster

        const baseR = selected.type === 'critical' ? 3.5 : selected.type === 'suspicious' ? 3.0 : 1.8 + Math.random() * 1.5;

        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: baseR,
          baseRadius: baseR,
          color: selected.color,
          glowColor: selected.glow,
          alpha: 0.3 + Math.random() * 0.6,
          type: selected.type,
        });
      }
    };

    initNodes();

    const maxDist = 135;
    const mouseRadius = 180;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle cyber grid background lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const mouse = mouseRef.current;

      // Update node positions and handle boundaries
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) {
          node.x = 0;
          node.vx *= -1;
        } else if (node.x > width) {
          node.x = width;
          node.vx *= -1;
        }

        if (node.y < 0) {
          node.y = 0;
          node.vy *= -1;
        } else if (node.y > height) {
          node.y = height;
          node.vy *= -1;
        }

        // Mouse interaction: push away gently or brighten
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius && dist > 0) {
            const force = (mouseRadius - dist) / mouseRadius;
            node.x += (dx / dist) * force * 1.5;
            node.y += (dy / dist) * force * 1.5;
            node.radius = node.baseRadius * (1 + force * 0.8);
          } else {
            node.radius = node.baseRadius;
          }
        } else {
          node.radius = node.baseRadius;
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const factor = 1 - dist / maxDist;
            let strokeStyle = `rgba(16, 185, 129, ${factor * 0.18})`;

            if (n1.type === 'critical' || n2.type === 'critical') {
              strokeStyle = `rgba(239, 68, 68, ${factor * 0.35})`;
            } else if (n1.type === 'suspicious' || n2.type === 'suspicious') {
              strokeStyle = `rgba(245, 158, 11, ${factor * 0.28})`;
            }

            // Check if mouse is close to the line
            if (mouse.active) {
              const midX = (n1.x + n2.x) / 2;
              const midY = (n1.y + n2.y) / 2;
              const mDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
              if (mDist < 100) {
                strokeStyle = `rgba(6, 182, 212, ${factor * 0.6})`;
              }
            }

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = factor * 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Outer glow
        if (node.type === 'critical' || node.type === 'suspicious') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = node.glowColor;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.type === 'critical' ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ background: 'transparent' }}
    />
  );
};
