import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
  subtext?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Initializing Peak Day OS',
  subtext = 'Validating secure session and user profile...',
}) => {
  return (
    <div
      id="peak-auth-loading-screen"
      className="fixed inset-0 z-50 bg-[#07090E] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Dynamic ambient backdrops */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-emerald-600/10 blur-[140px] pointer-events-none" />

      {/* Center glowing logo */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        <div className="relative">
          {/* Pulsing ring animation */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-[-10px] rounded-3xl bg-blue-500/20 blur-md pointer-events-none"
          />

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1.5px] shadow-2xl shadow-blue-500/30 flex items-center justify-center relative">
            <div className="w-full h-full rounded-[22px] bg-[#090C15] flex items-center justify-center">
              <Zap className="w-8 h-8 text-blue-400 fill-blue-400/20" />
            </div>
          </div>
        </div>

        {/* Brand & Loading state */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Peak Day</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              OS
            </span>
          </div>

          <p className="text-sm font-medium text-slate-200">{message}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{subtext}</p>
        </div>

        {/* Progress Bar Indicator */}
        <div className="w-48 h-1 bg-white/[0.08] rounded-full overflow-hidden relative">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full"
          />
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Protected Authentication</span>
        </div>
      </div>
    </div>
  );
};
