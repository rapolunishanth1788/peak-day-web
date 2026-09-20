import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'subtle' | 'elevated' | 'glow-blue' | 'glow-emerald';
  interactiveTilt?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'standard',
  interactiveTilt = false,
  onClick,
  style,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coords for subtle 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth tilt recovery
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    mouseX.set(clientX / width - 0.5);
    mouseY.set(clientY / height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const variantStyles = {
    standard:
      'bg-[#101420]/75 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.36)]',
    subtle:
      'bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
    elevated:
      'bg-[#151B2B]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
    'glow-blue':
      'bg-[#101420]/80 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_30px_rgba(10,132,255,0.12)]',
    'glow-emerald':
      'bg-[#101420]/80 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(48,209,88,0.12)]',
  }[variant];

  return (
    <motion.div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={
        interactiveTilt
          ? {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              ...style,
            }
          : style
      }
      whileHover={interactiveTilt ? undefined : { y: -2, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl transition-colors duration-200 overflow-hidden ${variantStyles} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle top reflection rim (Apple hardware/UI inspired) */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Ambient hover light spot */}
      {interactiveTilt && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]"
        />
      )}

      {children}
    </motion.div>
  );
};
