import React from 'react';

// Subtle 3D Titanium Olympic Bumper Plate Graphic
export const TitaniumPlateGraphic: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="plate-grad" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="60%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
      <linearGradient id="plate-rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#1e293b" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="plate-specular" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <filter id="plate-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
      </filter>
    </defs>
    {/* Outer shadow base */}
    <circle cx="50" cy="50" r="46" fill="url(#plate-grad)" filter="url(#plate-shadow)" stroke="url(#plate-rim)" strokeWidth="3" />
    {/* Concentric grooved ring */}
    <circle cx="50" cy="50" r="38" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
    <circle cx="50" cy="50" r="32" fill="#0f172a" stroke="#334155" strokeWidth="2" />
    {/* 3D Inner Hub */}
    <circle cx="50" cy="50" r="16" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="8" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Specular sheen */}
    <ellipse cx="44" cy="30" rx="22" ry="10" fill="url(#plate-specular)" transform="rotate(-25 44 30)" />
    {/* 45 LBS text engraving */}
    <text x="50" y="26" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold" letterSpacing="1">PEAK DAY</text>
    <text x="50" y="78" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" letterSpacing="1">45 LBS</text>
  </svg>
);

// Subtle 3D Hex Dumbbell Graphic
export const HexDumbbellGraphic: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="db-handle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="db-head-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="db-accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Left Head */}
    <path d="M14 36 L28 24 L36 34 L30 58 L20 68 L10 56 Z" fill="url(#db-head-1)" stroke="#475569" strokeWidth="1.5" />
    <path d="M28 24 L36 34 L30 58 L22 48 Z" fill="#475569" opacity="0.3" />
    {/* Knurled Handle with angled grip */}
    <rect x="34" y="44" width="32" height="12" rx="3" fill="url(#db-handle)" stroke="#334155" strokeWidth="1" transform="rotate(-18 50 50)" />
    {/* Knurling ridges */}
    <line x1="43" y1="42" x2="40" y2="56" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
    <line x1="48" y1="40" x2="45" y2="54" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
    <line x1="53" y1="38" x2="50" y2="52" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
    <line x1="58" y1="36" x2="55" y2="50" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
    {/* Right Head */}
    <path d="M64 42 L74 30 L88 38 L92 62 L80 74 L68 64 Z" fill="url(#db-head-1)" stroke="#475569" strokeWidth="1.5" />
    <path d="M74 30 L88 38 L92 62 L80 52 Z" fill="#475569" opacity="0.4" />
    {/* Emerald Power Badge Ring */}
    <circle cx="80" cy="52" r="4" fill="url(#db-accent)" />
  </svg>
);

// Subtle 3D Trophy / PR Medal Graphic
export const TrophyPRGraphic: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
      <linearGradient id="gold-specular" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Pedestal */}
    <rect x="36" y="78" width="28" height="10" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5" />
    <rect x="42" y="68" width="16" height="10" fill="#1e293b" />
    {/* Cup Body */}
    <path d="M28 20 H72 C72 20 74 54 50 58 C26 54 28 20 28 20 Z" fill="url(#gold-grad)" stroke="#ca8a04" strokeWidth="1.5" />
    {/* Cup Left Handle */}
    <path d="M28 26 C16 26 14 42 28 44" stroke="url(#gold-grad)" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Cup Right Handle */}
    <path d="M72 26 C84 26 86 42 72 44" stroke="url(#gold-grad)" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Star inside cup */}
    <path d="M50 28 L52.5 35 H60 L54 39.5 L56.5 46.5 L50 42 L43.5 46.5 L46 39.5 L40 35 H47.5 Z" fill="#ffffff" opacity="0.9" />
    {/* Specular highlight */}
    <ellipse cx="40" cy="30" rx="5" ry="12" fill="url(#gold-specular)" transform="rotate(-15 40 30)" />
  </svg>
);

// 3D Flame Streak Graphic
export const FlameStreakGraphic: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="flame-outer" x1="0%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#facc15" />
      </linearGradient>
      <linearGradient id="flame-inner" x1="0%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="60%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#ffffff" />
      </linearGradient>
    </defs>
    {/* Outer Tongue */}
    <path
      d="M50 8 C54 28 76 38 76 62 C76 80 64 92 50 92 C36 92 24 80 24 62 C24 44 42 30 50 8 Z"
      fill="url(#flame-outer)"
    />
    {/* Inner Core Flame */}
    <path
      d="M50 36 C52 48 64 56 64 68 C64 78 58 84 50 84 C42 84 36 78 36 68 C36 58 46 50 50 36 Z"
      fill="url(#flame-inner)"
    />
  </svg>
);
