import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

interface FeatureBentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FeatureBentoCard({ children, className, ...props }: FeatureBentoCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const spotlightStyle = {
    background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
  };

  const borderSpotlightStyle = {
    maskImage: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
    WebkitMaskImage: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-[18px] transition-all duration-300',
        'hover:shadow-md hover:shadow-black/[0.04]',
        surfaceCardCls,
        className,
      )}
      {...props}
    >
      {/* 1. Spotlight Background Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={spotlightStyle}
      />

      {/* 2. Spotlight Border Glow Shine */}
      <div
        className="pointer-events-none absolute -inset-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 rounded-[18px] border border-violet-500/35 dark:border-violet-500/45"
        style={borderSpotlightStyle}
      />

      {/* 3. Card Content Container */}
      <div className="relative z-20 flex h-full flex-col">
        {children}
      </div>
    </div>
  );
}
export default FeatureBentoCard;
