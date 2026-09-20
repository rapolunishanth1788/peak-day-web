import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface AiOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isThinking?: boolean;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  className = '',
  size = 'md',
  isThinking = false,
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      {/* Outer ambient pulsing chromatic aura */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.25, 1] : [1, 1.15, 1],
          opacity: isThinking ? [0.45, 0.8, 0.45] : [0.35, 0.6, 0.35],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: isThinking ? 4 : 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 blur-xl opacity-40 pointer-events-none"
      />

      {/* Counter-rotating cyan & violet diffuse flare */}
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [0.92, 1.08, 0.92],
        }}
        transition={{
          duration: isThinking ? 5 : 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-1 rounded-full bg-gradient-to-bl from-cyan-400/30 via-violet-600/30 to-emerald-400/20 blur-md pointer-events-none"
      />

      {/* Concentric orbital energetic rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full border border-blue-400/30 border-dashed pointer-events-none"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-3.5 rounded-full border border-emerald-400/25 border-dotted pointer-events-none"
      />

      {/* The Core Orb Spherical Body with Apple Glass Refraction */}
      <motion.div
        animate={{
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A]/90 to-[#030712] border border-white/25 shadow-[inset_0_2px_8px_rgba(255,255,255,0.35),0_8px_32px_rgba(10,132,255,0.35)] flex items-center justify-center overflow-hidden backdrop-blur-xl"
      >
        {/* Plasma swirling gradient inside core */}
        <motion.div
          animate={{
            x: ['-20%', '20%', '-20%'],
            y: ['-20%', '20%', '-20%'],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(56,189,248,0.7),rgba(99,102,241,0.5)_40%,rgba(16,185,129,0.3)_75%,transparent)] blur-sm"
        />

        {/* Specular curved reflection crescent (Apple glass touch) */}
        <div className="absolute top-1 left-2 right-2 h-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

        {/* Core AI glyph */}
        <div className="relative z-20 flex flex-col items-center justify-center text-white">
          <motion.div
            animate={{
              scale: isThinking ? [1, 1.2, 1] : [1, 1.08, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-200 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
