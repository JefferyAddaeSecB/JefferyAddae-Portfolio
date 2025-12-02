import { useEffect, useRef } from 'react';

interface GlowingProfileImageProps {
  imageUrl: string;
  altText: string;
  className?: string;
  glowColor?: string;
  glowIntensity?: number;
}

const GlowingProfileImage = ({
  imageUrl,
  altText,
  className = "",
  glowColor = '#ff6b00',
  glowIntensity = 0.8
}: GlowingProfileImageProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!wrapper) return;
      
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top;  // y position within the element
      
      // Calculate center point
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate the angle based on mouse position relative to center
      const angle = Math.atan2(y - centerY, x - centerX);
      
      // Calculate the glow position at the edge of the circle
      const radius = rect.width / 2; // Assuming it's a perfect circle
      const glowX = Math.cos(angle) * radius + centerX;
      const glowY = Math.sin(angle) * radius + centerY;
      
      // Update the pseudo-element that creates the glow
      wrapper.style.setProperty('--glow-x', `${glowX}px`);
      wrapper.style.setProperty('--glow-y', `${glowY}px`);
      wrapper.style.setProperty('--glow-opacity', '1');
    };
    
    const handleMouseLeave = () => {
      if (!wrapper) return;
      wrapper.style.setProperty('--glow-opacity', '0.5');
    };
    
    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    
    // Set initial properties
    wrapper.style.setProperty('--glow-color', glowColor);
    wrapper.style.setProperty('--glow-intensity', glowIntensity.toString());
    wrapper.style.setProperty('--glow-opacity', '0.5');
    
    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [glowColor, glowIntensity]);
  
  return (
    <div 
      ref={wrapperRef}
      className={`relative overflow-hidden glow-image ${className}`}
      style={{
        /* Custom properties for JS manipulation */
        '--glow-color': glowColor,
        '--glow-intensity': glowIntensity,
      } as React.CSSProperties}
    >
      {/* Inline styles added directly to the component */}
      
      <img 
        src={imageUrl} 
        alt={altText} 
        className="w-full h-full object-cover z-0 relative"
      />
    </div>
  );
};

export default GlowingProfileImage;