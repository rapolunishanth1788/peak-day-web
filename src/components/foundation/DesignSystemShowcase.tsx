import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Toggle } from '../ui/Toggle';
import { StatWidget } from '../ui/StatWidget';
import {
  Sparkles,
  Zap,
  Dumbbell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Sliders,
  Layers,
  Palette,
  Type,
  MousePointerClick,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [toggleVal, setToggleVal] = useState(true);
  const [toggleHaptics, setToggleHaptics] = useState(true);
  const [progressVal, setProgressVal] = useState(68);
  const [inputText, setInputText] = useState('Production Design System');
  const [inputError, setInputError] = useState(false);

  const simulateLoading = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 1800);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Foundation Overview */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#141A2D]/90 to-[#0C0F1A]/80 border border-white/[0.1] shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Milestone 1 — Design System & Visual Foundation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Peak Day Design System
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            A precision-engineered, Apple-inspired dark interface. Designed for students and fitness athletes
            combining ultra-clean glassmorphism, disciplined spacing, responsive micro-interactions, and 
            subtle depth physics.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="blue" size="md">
              Dark-First Palette
            </Badge>
            <Badge variant="emerald" size="md">
              Apple Glass Blur 24px
            </Badge>
            <Badge variant="purple" size="md">
              Motion Physics Springs
            </Badge>
            <Badge variant="default" size="md">
              WCAG AA Contrast
            </Badge>
          </div>
        </div>
      </div>

      {/* 1. Color System Palette */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <Palette className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight">1. Color System & Light Spectrum</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Dark-first midnight slate with refined Apple accents. Strictly avoids aggressive gamer neon; uses 
          optical luminance calibrated for both study focus and athletic endurance.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-[#07090E] border border-white/10 flex flex-col gap-2">
            <div className="h-14 rounded-xl bg-[#07090E] border border-white/10" />
            <div>
              <p className="text-xs font-semibold text-white">Midnight Base</p>
              <p className="text-[11px] font-mono text-slate-400">#07090E</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0E1322] border border-white/10 flex flex-col gap-2">
            <div className="h-14 rounded-xl bg-[#0E1322] border border-white/10" />
            <div>
              <p className="text-xs font-semibold text-white">Slate Surface</p>
              <p className="text-[11px] font-mono text-slate-400">#0E1322</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0E1322] border border-white/10 flex flex-col gap-2">
            <div className="h-14 rounded-xl bg-[#0A84FF] shadow-md shadow-blue-500/20" />
            <div>
              <p className="text-xs font-semibold text-white">Apple Azure</p>
              <p className="text-[11px] font-mono text-slate-400">#0A84FF</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0E1322] border border-white/10 flex flex-col gap-2">
            <div className="h-14 rounded-xl bg-[#30D158] shadow-md shadow-emerald-500/20" />
            <div>
              <p className="text-xs font-semibold text-white">Fitness Emerald</p>
              <p className="text-[11px] font-mono text-slate-400">#30D158</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0E1322] border border-white/10 flex flex-col gap-2">
            <div className="h-14 rounded-xl bg-[#FF9F0A] shadow-md shadow-amber-500/20" />
            <div>
              <p className="text-xs font-semibold text-white">Solar Amber</p>
              <p className="text-[11px] font-mono text-slate-400">#FF9F0A</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0E1322] border border-white/10 flex flex-col gap-2">
            <div className="h-14 rounded-xl bg-[#BF5AF2] shadow-md shadow-purple-500/20" />
            <div>
              <p className="text-xs font-semibold text-white">Amethyst</p>
              <p className="text-[11px] font-mono text-slate-400">#BF5AF2</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Typography Scale */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <Type className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight">2. Typography & Hierarchy</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Plus Jakarta Sans paired with SF-styled tracking and JetBrains Mono for telemetry metrics.
        </p>

        <GlassCard className="p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xs font-mono text-slate-400">Display 32px / 700</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Peak Day Command Center
            </span>
          </div>

          <div className="border-b border-white/[0.06] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xs font-mono text-slate-400">Section Title 20px / 600</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-100">
              Academics & Training Synergy
            </span>
          </div>

          <div className="border-b border-white/[0.06] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xs font-mono text-slate-400">Body Standard 14px / 400</span>
            <span className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Clean, legible paragraph text styled with optimal line height (1.6) for sustained study sessions without eye strain.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
            <span className="text-xs font-mono text-slate-400">Telemetry Mono 13px / 500</span>
            <span className="text-sm font-mono text-blue-400">
              TIME: 09:41:00 UTC • CALORIES: 840 KCAL • VO2: 54.2
            </span>
          </div>
        </GlassCard>
      </section>

      {/* 3. Interactive Buttons & Micro-Interactions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <MousePointerClick className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight">3. Buttons & Micro-Interactions</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Tactile spring physics using <code className="text-blue-300">motion/react</code> with <code className="text-blue-300">whileHover</code> and <code className="text-blue-300">whileTap</code>. Click the buttons to experience micro-spring responses.
        </p>

        <GlassCard className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" leftIcon={<Zap className="w-4 h-4" />}>
              Primary Azure
            </Button>
            <Button variant="secondary">Secondary Dark</Button>
            <Button variant="glass" leftIcon={<Sparkles className="w-4 h-4" />}>
              Glass Surface
            </Button>
            <Button variant="accent-emerald" leftIcon={<Dumbbell className="w-4 h-4" />}>
              Fitness Action
            </Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Destructive</Button>
            <Button
              variant="primary"
              isLoading={buttonLoading}
              onClick={simulateLoading}
            >
              {buttonLoading ? 'Syncing...' : 'Test Loading State'}
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-3">
            <span className="text-xs text-slate-400">Size scale:</span>
            <Button size="sm" variant="glass">Small (32px)</Button>
            <Button size="md" variant="glass">Medium (40px)</Button>
            <Button size="lg" variant="glass">Large (48px)</Button>
          </div>
        </GlassCard>
      </section>

      {/* 4. Glass Cards with 3D Depth & Tilt */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight">4. Glass Cards & Subtle 3D Tilt</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Move your mouse over the cards below to experience Apple-inspired spatial 3D parallax tilt and ambient lighting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard interactiveTilt className="p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Standard Glass Card</p>
                <p className="text-[10px] text-slate-400">Interactive 3D Tilt</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hover over this card to see smooth physics-based rotation responding to cursor coordinates with spring recovery.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Apple Glass Blur</span>
              <Badge variant="blue">20px Blur</Badge>
            </div>
          </GlassCard>

          <GlassCard interactiveTilt variant="glow-emerald" className="p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Fitness Halo Card</p>
                <p className="text-[10px] text-slate-400">Accent Border Glow</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with a restrained emerald ambient glow for workout splits, hydration milestones, and PR tracking.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Ring Status</span>
              <Badge variant="emerald">In Progress</Badge>
            </div>
          </GlassCard>

          <GlassCard interactiveTilt variant="elevated" className="p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Elevated Surface</p>
                <p className="text-[10px] text-slate-400">Deep Glass Layer</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Higher z-index layer for modals, flyouts, and critical priority items with mathematical shadow dispersion.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Depth Level</span>
              <Badge variant="purple">Layer 2</Badge>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 5. Inputs & Form Controls */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight">5. Inputs, Controls & Form Components</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Clean input fields with Apple-style focus rings, clear buttons, search adornments, and iOS pill toggles.
        </p>

        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Course or Goal Name"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onClear={() => setInputText('')}
                error={inputError ? 'Title cannot be blank' : undefined}
                helperText={!inputError ? 'Type something or toggle error state below' : undefined}
              />

              <Input
                isSearch
                placeholder="Search across 9 OS modules..."
                rightElement={
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/10 rounded border border-white/10 text-slate-300">
                    ⌘K
                  </kbd>
                }
              />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInputError((prev) => !prev)}
                >
                  Toggle Error State
                </Button>
              </div>
            </div>

            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
              <Toggle
                label="Haptic & Audio Feedback"
                description="Subtle clicks on button actions and task completion"
                checked={toggleHaptics}
                onChange={setToggleHaptics}
              />

              <div className="h-[1px] bg-white/[0.06]" />

              <Toggle
                label="Student Focus Mode"
                description="Silence notifications during scheduled study blocks"
                checked={toggleVal}
                onChange={setToggleVal}
              />

              <div className="h-[1px] bg-white/[0.06]" />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Interactive Progress Slider</span>
                  <span className="font-mono text-blue-400">{progressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 6. Metrics & Progress Systems */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight">6. Progress & Activity Telemetry</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Visual gauges and progress bars designed for student-athlete balance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatWidget
            label="Daily Academic Target"
            value="4 / 5"
            subvalue="Tasks"
            icon={BookOpen}
            color="blue"
            progress={progressVal}
            trend={{ value: '+15%', isPositive: true }}
          />

          <StatWidget
            label="Active Calories"
            value="680"
            subvalue="kcal"
            icon={Dumbbell}
            color="emerald"
            progress={Math.min(100, Math.round(progressVal * 1.1))}
            trend={{ value: '+85 kcal', isPositive: true }}
          />

          <StatWidget
            label="Schedule Adherence"
            value="92%"
            subvalue="on time"
            icon={Calendar}
            color="purple"
            progress={92}
          />

          <StatWidget
            label="Streak Record"
            value="12"
            subvalue="Days"
            icon={Zap}
            color="amber"
            progress={80}
            trend={{ value: 'Best: 15d', isPositive: true }}
          />
        </div>

        <GlassCard className="p-6 space-y-4">
          <ProgressBar
            label="Overall Daily Peak Score"
            value={progressVal}
            variant="gradient"
            size="lg"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <ProgressBar label="Academics" value={85} variant="blue" size="sm" />
            <ProgressBar label="Training & Recovery" value={progressVal} variant="emerald" size="sm" />
            <ProgressBar label="Habit Adherence" value={72} variant="amber" size="sm" />
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
