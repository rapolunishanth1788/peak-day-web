import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowLeft,
  Compass,
  Layout,
  ExternalLink,
} from 'lucide-react';
import { SectionId } from '../../types';

interface ModeSwitcherProps {
  viewMode: 'landing' | 'design_system' | 'os_preview' | string;
  onChangeViewMode: (mode: 'landing' | 'design_system' | 'os_preview') => void;
  currentSection: SectionId;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  viewMode,
  onChangeViewMode,
  currentSection,
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0D111E]/80 border border-white/[0.08] backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Peak Day Operating Environment</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live Preview
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Switch between the public landing page, interactive OS sections, and design tokens
          </p>
        </div>
      </div>

      <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/[0.06] shrink-0 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => onChangeViewMode('landing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            viewMode === 'landing'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Landing Page</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode('os_preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            viewMode === 'os_preview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>OS Workspace ({currentSection})</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode('design_system')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            viewMode === 'design_system'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Design Tokens</span>
        </button>
      </div>
    </div>
  );
};
