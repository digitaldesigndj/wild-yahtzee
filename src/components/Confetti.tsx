import { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const CONFETTI_COLORS = [
  '#FFC107', // Amber Gold
  '#FF5722', // Deep Orange
  '#4CAF50', // Emerald Green
  '#00BCD4', // Cyan
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#3F51B5', // Indigo
];

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const activeRef = useRef<boolean>(active);

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      initConfetti();
    }
  }, [active]);

  const initConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = 150;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        // Burst from the center bottom or scatter randomly across the screen
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20, // start above screen
        size: Math.random() * 8 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
        opacity: 1,
      });
    }

    particlesRef.current = particles;

    // Start rendering loop if not already running
    if (animationFrameRef.current === null) {
      tick();
    }
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    let alive = false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update position
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y / 30) * 0.5; // gentle swaying
      p.rotation += p.rotationSpeed;

      // Slow descent down
      if (p.y > canvas.height * 0.7) {
        p.opacity -= 0.015;
      }

      if (p.opacity > 0 && p.y < canvas.height) {
        alive = true;

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Draw a neat rectangle confetti
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    }

    if (alive && activeRef.current) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameRef.current = null;
      if (onComplete) onComplete();
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
      id="confetti-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}
