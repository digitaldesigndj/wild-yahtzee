import { useEffect, useRef } from 'react';

interface FireworksProps {
  active: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  trail: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
}

const FIREWORKS_COLORS = [
  '#FF3366', // Hot Pink
  '#FF9900', // Neon Orange
  '#33FF66', // Bright Green
  '#33CCFF', // Vivid Cyan
  '#CC33FF', // Cosmic Purple
  '#FFFF33', // Neon Yellow
];

export default function Fireworks({ active }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const activeRef = useRef<boolean>(active);

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      startFireworks();
    }
  }, [active]);

  const createSparks = (x: number, y: number, color: string) => {
    const count = 60 + Math.floor(Math.random() * 40);
    const sparks = sparksRef.current;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        gravity: 0.06,
        trail: [],
      });
    }
  };

  const spawnRocket = (width: number, height: number) => {
    const rx = Math.random() * (width - 160) + 80;
    const ry = height;
    const tx = Math.random() * (width - 160) + 80;
    const ty = Math.random() * (height * 0.45) + height * 0.1;
    const vy = -Math.sqrt(2 * 0.08 * (ry - ty)); // compute velocity with a small gravity formula

    const color = FIREWORKS_COLORS[Math.floor(Math.random() * FIREWORKS_COLORS.length)];

    rocketsRef.current.push({
      x: rx,
      y: ry,
      tx,
      ty,
      vy,
      color,
      exploded: false,
      trail: [],
    });
  };

  const startFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    rocketsRef.current = [];
    sparksRef.current = [];

    // Spawn 3 initial rockets
    spawnRocket(canvas.width, canvas.height);
    setTimeout(() => spawnRocket(canvas.width, canvas.height), 400);
    setTimeout(() => spawnRocket(canvas.width, canvas.height), 800);

    if (animationFrameRef.current === null) {
      tick();
    }
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fully transparent clear on every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rockets = rocketsRef.current;
    const sparks = sparksRef.current;

    // Update & draw Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];

      // Update trail
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) {
        r.trail.shift();
      }

      r.y += r.vy;
      r.vy += 0.08; // small rocket gravity

      // Draw rocket trail
      ctx.save();
      ctx.beginPath();
      for (let k = 0; k < r.trail.length; k++) {
        const pt = r.trail[k];
        const opacity = (k + 1) / r.trail.length;
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = opacity * 0.4;
        ctx.lineWidth = 2;
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // Draw rocket head
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();

      // Trigger explosion near apex
      if (r.vy >= -1) {
        createSparks(r.x, r.y, r.color);
        rockets.splice(i, 1);

        // Spawn a replacement rocket if we are still active
        if (activeRef.current) {
          setTimeout(() => {
            if (activeRef.current) spawnRocket(canvas.width, canvas.height);
          }, Math.random() * 1500 + 500);
        }
      }
    }

    // Update & draw Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];

      // Update trail
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 5) {
        s.trail.shift();
      }

      s.x += s.vx;
      s.y += s.vy;
      s.vy += s.gravity;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      // Draw spark trail
      ctx.save();
      ctx.beginPath();
      for (let k = 0; k < s.trail.length; k++) {
        const pt = s.trail[k];
        const opacity = ((k + 1) / s.trail.length) * s.alpha;
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = opacity * 0.5;
        ctx.lineWidth = 1.5;
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // Draw spark head
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const hasContent = rockets.length > 0 || sparks.length > 0;

    if (activeRef.current || hasContent) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameRef.current = null;
    }
  };

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!active) return null;

  return (
    <canvas
      id="fireworks-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-40 bg-transparent"
    />
  );
}
