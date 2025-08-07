import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  brightness: number;
}

const NetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createPoints = () => {
      const points: Point[] = [];
      const numPoints = Math.floor((window.innerWidth * window.innerHeight) / 10000);
      
      for (let i = 0; i < numPoints; i++) {
        points.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2.5 + 1.5,
          brightness: Math.random() * 0.5 + 0.5
        });
      }
      
      pointsRef.current = points;
    };

    const drawLines = (point: Point, points: Point[]) => {
      const maxDistance = 180;
      
      points.forEach(otherPoint => {
        const dx = point.x - otherPoint.x;
        const dy = point.y - otherPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance && point !== otherPoint) {
          const opacity = (1 - distance / maxDistance) * 0.3;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(135, 206, 235, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(otherPoint.x, otherPoint.y);
          ctx.stroke();
        }
      });
    };

    const updatePoints = () => {
      const points = pointsRef.current;
      points.forEach(point => {
        const dx = mouseRef.current.x - point.x;
        const dy = mouseRef.current.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;

        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.2;
          point.vx -= dx * force / distance;
          point.vy -= dy * force / distance;
        }

        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > window.innerWidth) point.vx *= -1;
        if (point.y < 0 || point.y > window.innerHeight) point.vy *= -1;

        point.vx *= 0.99;
        point.vy *= 0.99;
      });
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a2f3f');
      gradient.addColorStop(1, '#0f1c2a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      
      points.forEach(point => drawLines(point, points));
      
      points.forEach(point => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius * 3
        );
        gradient.addColorStop(0, `rgba(135, 206, 235, ${point.brightness})`);
        gradient.addColorStop(0.6, `rgba(135, 206, 235, ${0.3 * point.brightness})`);
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(point.x, point.y, point.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      updatePoints();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    resizeCanvas();
    createPoints();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createPoints();
    });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default NetworkBackground; 