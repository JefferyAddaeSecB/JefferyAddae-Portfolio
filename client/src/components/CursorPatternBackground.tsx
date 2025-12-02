import { useEffect, useRef } from 'react';

interface CursorPatternBackgroundProps {
  color?: string;
  particleCount?: number;
  particleSize?: number;
  lineLength?: number;
  speed?: number;
}

const CursorPatternBackground = ({
  color = '#ff6b00', 
  particleCount = 70,
  particleSize = 1.5,
  lineLength = 100,
  speed = 0.3
}: CursorPatternBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Create particles
    const particles: {x: number; y: number; vx: number; vy: number; size: number}[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * particleSize + 0.5
      });
    }
    
    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    let mouseRadius = 100;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.3;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Calculate distance from mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Move particles slightly toward the mouse when close
        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          p.vx += dx * force * 0.02;
          p.vy += dy * force * 0.02;
        }
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Add friction to slow down
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) {
          p.vx *= -1;
        }
        if (p.y < 0 || p.y > canvas.height) {
          p.vy *= -1;
        }
        
        // Connect with nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < lineLength) {
            ctx.globalAlpha = 1 - (distance / lineLength);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color, particleCount, particleSize, lineLength, speed]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none"
    />
  );
};

export default CursorPatternBackground;