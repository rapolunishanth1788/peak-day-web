import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  CheckCircle2,
  GraduationCap,
  Dumbbell,
  Sparkles,
  ArrowRight,
  Shield,
  Calendar,
  Flame,
  Brain,
  Layers,
  ChevronRight,
  BarChart3,
  Clock,
  Compass,
  Cpu,
  Star,
  Check,
  Menu,
  X,
  Target,
  FileText,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { InteractiveHeroVisual } from './InteractiveHeroVisual';

interface LandingPageProps {
  onLoginClick: () => void;
  onGetStartedClick: () => void;
  onLaunchOS: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onGetStartedClick,
  onLaunchOS,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'productivity' | 'academics' | 'fitness' | 'ai'>('productivity');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-blue-500/30 selection:text-white relative overflow-x-hidden font-sans">
      {/* Ambient background glows */}
      <div className="fixed top-[-15%] left-[25%] w-[650px] h-[650px] rounded-full bg-blue-900/15 blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-[45%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[10%] w-[700px] h-[700px] rounded-full bg-emerald-950/15 blur-[180px] pointer-events-none -z-10" />

      {/* 1. PREMIUM NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#07090E]/75 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-[#090C15] flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400 fill-blue-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Peak Day</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[10px] font-mono text-blue-400 font-semibold tracking-wider uppercase">
                  OS v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Personal Operating System</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('productivity-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Productivity
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('academics-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Academics
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('fitness-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fitness
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ai-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              AI Synapse
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features-overview')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </nav>

          {/* Actions: Login & Get Started */}
          <div className="flex items-center gap-3">
            <Button
              id="landing-login-btn"
              variant="ghost"
              size="md"
              onClick={onLoginClick}
              className="text-slate-300 hover:text-white hidden sm:inline-flex"
            >
              Log In
            </Button>
            <Button
              id="landing-get-started-btn"
              variant="primary"
              size="md"
              onClick={onGetStartedClick}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white md:hidden ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-[#0A0D17]/95 backdrop-blur-2xl px-6 py-5 space-y-4"
            >
              <button
                type="button"
                onClick={() => scrollToSection('productivity-section')}
                className="block w-full text-left py-2 text-sm font-medium text-slate-200"
              >
                Productivity
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('academics-section')}
                className="block w-full text-left py-2 text-sm font-medium text-slate-200"
              >
                Academics
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('fitness-section')}
                className="block w-full text-left py-2 text-sm font-medium text-slate-200"
              >
                Fitness
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('ai-section')}
                className="block w-full text-left py-2 text-sm font-medium text-slate-200"
              >
                AI Assistant
              </button>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <Button variant="secondary" size="md" onClick={onLoginClick} className="w-full">
                  Log In
                </Button>
                <Button variant="primary" size="md" onClick={onGetStartedClick} className="w-full">
                  Get Started Free
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>THE ALL-IN-ONE PERSONAL OPERATING SYSTEM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                best day.
              </span>
            </h1>

            {/* Supporting Pitch */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-normal">
              Peak Day unifies <strong className="text-white font-semibold">productivity</strong>,{' '}
              <strong className="text-white font-semibold">academics</strong>,{' '}
              <strong className="text-white font-semibold">fitness</strong>, and{' '}
              <strong className="text-white font-semibold">AI intelligence</strong> into a seamless,
              Apple-inspired daily system built for ambitious students and athletes.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                id="hero-start-os-btn"
                variant="primary"
                size="lg"
                onClick={onGetStartedClick}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-xl shadow-blue-600/30"
              >
                Start Operating Peak Day
              </Button>

              <Button
                id="hero-preview-os-btn"
                variant="secondary"
                size="lg"
                onClick={onLaunchOS}
                leftIcon={<Layers className="w-4 h-4 text-blue-400" />}
                className="w-full sm:w-auto"
              >
                Explore Live Workspace
              </Button>
            </div>

            {/* Trust Metrics Pill Strip */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero tab clutter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Evidence-based focus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Autonomous AI alignment</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Animated Visual Representing 4 Domains */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <InteractiveHeroVisual />
          </motion.div>
        </div>
      </section>

      {/* 3. QUAD-PILLAR ARCHITECTURE INTERACTION (Feature Selector) */}
      <section id="features-overview" className="py-20 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="blue" size="md" className="mb-3">
              INTEGRATED ARCHITECTURE
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Four Core Disciplines. One Connected Brain.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Eliminate context switching between separate calendar, workout, syllabus, and habit apps.
              Peak Day synchronizes your entire day under a single cognitive dashboard.
            </p>

            {/* Domain Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-fit mx-auto">
              <button
                type="button"
                onClick={() => setActiveFeatureTab('productivity')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFeatureTab === 'productivity'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Productivity & Routine</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('academics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFeatureTab === 'academics'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Academics & Study</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('fitness')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFeatureTab === 'fitness'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>Fitness & Nutrition</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFeatureTab === 'ai'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Synapse</span>
              </button>
            </div>
          </div>

          {/* Interactive Feature Tab Presentation */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeFeatureTab === 'productivity' && (
                <motion.div
                  key="productivity"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="elevated" className="p-8 border-blue-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Daily Tasks & Chrono-Schedule</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          Intelligent block scheduling that auto-allocates your highest mental focus
                          to tough tasks while protecting your sleep and recovery windows.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300 font-medium">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Priority matrices with deep-work session timers
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Visual calendar blocks that prevent cognitive overload
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Daily score calculation with completion momentum
                          </li>
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                          <span>MORNING BLOCK</span>
                          <span className="text-blue-400">08:00 - 11:30 AM</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                          <span className="text-white font-sans font-medium text-xs">Discrete Math Proofs</span>
                          <Badge variant="blue" size="sm">High Focus</Badge>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                          <span className="text-slate-300 font-sans font-medium text-xs">System Architecture RFC</span>
                          <span className="text-slate-400 text-[10px]">45 min</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-sans flex items-center gap-1.5 pt-1">
                          <Zap className="w-3.5 h-3.5" /> 2 hours and 15 mins uninterrupted focus achieved today.
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeFeatureTab === 'academics' && (
                <motion.div
                  key="academics"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="elevated" className="p-8 border-indigo-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Coursework, GPA & Exam Radar</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          Track course modules, assignment deadlines, weighted grade estimates, and active
                          spaced-repetition study milestones before crunch time.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300 font-medium">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Multi-semester GPA projection and syllabus tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Assignment countdowns with auto-estimated preparation hours
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Exam readiness scores synchronized with your study log
                          </li>
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                          <span>ACTIVE SEMESTER</span>
                          <span className="text-indigo-400">FALL 2026</span>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                          <div>
                            <div className="text-white font-sans font-medium text-xs">CS 229: Machine Learning</div>
                            <div className="text-[10px] text-slate-400">Midterm Nov 12 • 35% of Grade</div>
                          </div>
                          <Badge variant="purple" size="sm">94% (A)</Badge>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-slate-200 font-sans font-medium text-xs">BIO 141: Genetics</div>
                            <div className="text-[10px] text-slate-400">Lab Analysis 4 Due Friday</div>
                          </div>
                          <Badge variant="default" size="sm">91% (A-)</Badge>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeFeatureTab === 'fitness' && (
                <motion.div
                  key="fitness"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="elevated" className="p-8 border-emerald-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Workout Splits & Precision Nutrition</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          Log progressive overload sets, heart-rate zones, hydration targets, and macro ratios
                          without needing secondary fitness trackers.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300 font-medium">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            RPE & 1-Rep Max progressive overload tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Target macros (Protein, Carbs, Fats) with calorie surplus/deficit gauges
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Recovery metrics linked to your study intensity
                          </li>
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                          <span>TODAY'S TARGET</span>
                          <span className="text-emerald-400">PUSH (CHEST / DELTS)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-sans font-medium text-xs">Bench Press (Barbell)</span>
                            <span className="text-emerald-400 font-mono text-xs">4 x 8 @ 215 lbs</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Previous: 210 lbs • +5 lb Overload</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                            <div className="text-[10px] text-slate-400">PROTEIN</div>
                            <div className="text-xs font-bold text-emerald-400">182 / 190g</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                            <div className="text-[10px] text-slate-400">CALORIES</div>
                            <div className="text-xs font-bold text-slate-200">2,640 kcal</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.04] text-center">
                            <div className="text-[10px] text-slate-400">WATER</div>
                            <div className="text-xs font-bold text-blue-400">3.4 L</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeFeatureTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="elevated" className="p-8 border-amber-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Gemini Synapse Daily Advisor</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          Your server-side AI analyzes your daily cognitive loads, workout strain, and academic
                          calendar to provide actionable, hyper-personalized adjustments.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300 font-medium">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Autonomous daily plan synthesis and friction detection
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Burnout prevention when high-volume exams and workouts collide
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Natural language task scheduling: "Move calculus to post-workout"
                          </li>
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-[#090C16] border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                          <span>AI INSIGHT REPORT</span>
                          <span className="text-amber-400 font-mono">10:42 AM</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200 leading-relaxed font-sans">
                          "You have an organic chemistry quiz tomorrow morning at 09:00 AM. I recommend capping heavy leg volume today at 45 minutes to protect cognitive sharpness tonight."
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                          <span>ADAPTIVE ACTIONS</span>
                          <span className="text-blue-400 cursor-pointer hover:underline">Apply Suggestions (3) →</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. DEEP DIVE FEATURE SECTIONS */}

      {/* Feature Section 1: Productivity */}
      <section id="productivity-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="blue" size="md">
              01 • PRODUCTIVITY & ROUTINE
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Master your hours without willpower fatigue.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Most productivity apps fail because they treat your day like an infinite to-do bucket.
              Peak Day roots your tasks in finite time blocks, preserving energy for the work that matters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-blue-400 font-bold text-lg mb-1">Time Blocking</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visually schedule tasks into high-energy windows with automatic buffers.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-emerald-400 font-bold text-lg mb-1">Peak Index</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time quantitative rating of your daily focus and routine execution.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <GlassCard variant="elevated" className="p-6 border-white/15">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    PD
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Daily Focus Timeline</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Tuesday • Oct 24</span>
                  </div>
                </div>
                <Badge variant="emerald" size="sm">
                  Active Sprint
                </Badge>
              </div>

              {/* Task Items */}
              <div className="space-y-3">
                {[
                  { title: 'Complete Algorithm Analysis problem set', tag: 'Academics', time: '90m', done: true },
                  { title: 'Deadlift session & core stability circuits', tag: 'Fitness', time: '60m', done: true },
                  { title: 'Team standup and code architecture review', tag: 'Deep Work', time: '45m', done: false, active: true },
                  { title: 'Review flashcards: Neuroanatomy terminology', tag: 'Study', time: '30m', done: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      item.active
                        ? 'bg-blue-600/15 border-blue-500/30'
                        : item.done
                        ? 'bg-white/[0.02] border-white/5 opacity-70'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          item.done
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : item.active
                            ? 'border-blue-400 text-blue-400'
                            : 'border-white/20'
                        }`}
                      >
                        {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs ${
                          item.done ? 'line-through text-slate-400' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Academics */}
      <section id="academics-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <GlassCard variant="elevated" className="p-6 border-white/15">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <h4 className="text-sm font-semibold text-white">University Semester Cohort</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Cumulative GPA: 3.94 / 4.00</span>
                </div>
                <Badge variant="purple" size="sm">
                  Honor Roll
                </Badge>
              </div>

              <div className="space-y-4">
                {[
                  { course: 'CS 229: Machine Learning', code: 'Prof. Ng', grade: '96.4%', credit: '4 Credits', status: 'Exam in 12 days' },
                  { course: 'MATH 104: Real Analysis', code: 'Prof. Miller', grade: '92.1%', credit: '3 Credits', status: 'Problem Set Due Fri' },
                  { course: 'ECON 101: Microeconomics', code: 'Prof. Taylor', grade: '98.0%', credit: '3 Credits', status: 'On Track' },
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-white">{c.course}</div>
                        <div className="text-[11px] text-slate-400">{c.code} • {c.credit}</div>
                      </div>
                      <div className="text-sm font-mono font-bold text-indigo-400">{c.grade}</div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                      <span>STATUS: {c.status}</span>
                      <span className="text-emerald-400">98% Homework Submitted</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <Badge variant="purple" size="md">
              02 • ACADEMIC COMMAND
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Dominate your syllabus without the finals dread.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Keep coursework, reading deadlines, exam countdowns, and weighted grade simulations
              in lockstep. Never miss an assignment or miscalculate what you need on the final.
            </p>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs mt-0.5">
                  ✓
                </div>
                <span>Predictive GPA Calculator automatically simulates midterm & final exam outcomes.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs mt-0.5">
                  ✓
                </div>
                <span>Spaced repetition reminders auto-schedule study blocks based on exam proximity.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Fitness & Nutrition */}
      <section id="fitness-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="emerald" size="md">
              03 • FITNESS & NUTRITION
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              High cognitive performance demands high physical stamina.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Peak Day treats fitness as a foundational pillar rather than an afterthought.
              Coordinate your workout splits with your academic study schedule to stay energized.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl font-bold text-white mb-1 font-mono">4-Day</div>
                <div className="text-xs text-slate-400">Customizable Push/Pull/Legs/Upper split template</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl font-bold text-emerald-400 mb-1 font-mono">100%</div>
                <div className="text-xs text-slate-400">Macro sync with active resting caloric burn</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <GlassCard variant="elevated" className="p-6 border-white/15">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Daily Athletic Dashboard</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Strength & Vitality Matrix</span>
                </div>
                <Badge variant="emerald" size="sm">
                  Gym Ready
                </Badge>
              </div>

              {/* Nutrition Gauges */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Daily Macronutrient Targets</span>
                  <span className="text-emerald-400 font-mono text-[11px]">88% Met</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-white/[0.04]">
                    <div className="text-[10px] text-slate-400 font-mono">PROTEIN</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">190g</div>
                    <div className="text-[10px] text-slate-400">Goal: 185g</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.04]">
                    <div className="text-[10px] text-slate-400 font-mono">CARBS</div>
                    <div className="text-sm font-bold text-blue-400 font-mono">280g</div>
                    <div className="text-[10px] text-slate-400">Goal: 310g</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.04]">
                    <div className="text-[10px] text-slate-400 font-mono">FATS</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">65g</div>
                    <div className="text-[10px] text-slate-400">Goal: 70g</div>
                  </div>
                </div>
              </div>

              {/* Workout Block */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Push Intensity Session</div>
                    <div className="text-[11px] text-slate-300">5 Exercises • 18 Total Sets Completed</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">✓ Logged</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Feature Section 4: AI Synapse */}
      <section id="ai-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <GlassCard variant="elevated" className="p-6 border-amber-500/20 shadow-2xl shadow-amber-950/20">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Peak Day AI Copilot</h4>
                    <span className="text-[10px] text-amber-400/80 font-mono">Gemini 2.5 Flash Engine</span>
                  </div>
                </div>
                <Badge variant="amber" size="sm">
                  Real-time
                </Badge>
              </div>

              {/* Chat snippet */}
              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-xl bg-white/[0.04] text-slate-300 border border-white/5">
                  <span className="text-blue-400 font-semibold block mb-1">You:</span>
                  "I slept 5 hours last night and have a 3-hour lab this afternoon. Should I still max out on squats today?"
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Peak Day AI Recommendation:</span>
                  </div>
                  <p className="leading-relaxed text-xs">
                    "I suggest switching today's squats from heavy 3x3 to a moderate recovery circuit (RPE 6). 
                    Your CNS recovery score is down 22%, and your lab requires high attention. I've automatically postponed heavy compound sets to Thursday."
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Schedule and workout adjusted automatically</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <Badge variant="amber" size="md">
              04 • INTELLIGENT SYNAPSE
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              An AI that connects every facet of your life.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Standard chatbots don't know your GPA, your gym logs, or your calendar.
              Peak Day AI operates with full context of your day, acting like a private coach,
              academic advisor, and executive assistant wrapped into one.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-amber-400 font-bold text-sm mb-1">Contextual Awareness</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Queries understand your past performance, upcoming exams, and workout recovery.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-blue-400 font-bold text-sm mb-1">Proactive Optimization</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Flags potential time crunches before they turn into late nights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-10 sm:p-16 rounded-3xl glass-surface-elevated border border-blue-500/30 relative overflow-hidden shadow-2xl shadow-blue-950/80">
            {/* Background radial highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <Badge variant="blue" size="md" className="mb-4">
              LAUNCH YOUR SYSTEM
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Start operating at your highest peak today.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join students and fitness enthusiasts who replaced chaos with clarity.
              Zero complicated setup, completely free during initial preview.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button
                id="cta-get-started-btn"
                variant="primary"
                size="lg"
                onClick={onGetStartedClick}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-lg shadow-blue-600/40"
              >
                Get Started Free
              </Button>

              <Button
                id="cta-open-workspace-btn"
                variant="secondary"
                size="lg"
                onClick={onLaunchOS}
                leftIcon={<Layers className="w-4 h-4 text-blue-400" />}
                className="w-full sm:w-auto"
              >
                Launch Live App
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 font-mono mt-6">
              No credit card required • Instant access to full OS workspace
            </p>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#05070B] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">Peak Day</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The unified personal operating system for high-performing students and fitness-minded creators.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-2">
              © {new Date().getFullYear()} Peak Day OS. Built with precision.
            </div>
          </div>

          <div>
            <h5 className="text-xs font-mono uppercase text-slate-300 font-semibold tracking-wider mb-3">
              Operating Domains
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button type="button" onClick={() => scrollToSection('productivity-section')} className="hover:text-white transition-colors">
                  Productivity & Tasks
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('academics-section')} className="hover:text-white transition-colors">
                  Academics & GPA Radar
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('fitness-section')} className="hover:text-white transition-colors">
                  Fitness & Nutrition Splits
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('ai-section')} className="hover:text-white transition-colors">
                  Gemini Synapse Advisor
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-mono uppercase text-slate-300 font-semibold tracking-wider mb-3">
              Peak Day Platform
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button type="button" onClick={onLaunchOS} className="hover:text-white transition-colors">
                  Live OS Workspace
                </button>
              </li>
              <li>
                <button type="button" onClick={onLoginClick} className="hover:text-white transition-colors">
                  Account Sign In
                </button>
              </li>
              <li>
                <button type="button" onClick={onGetStartedClick} className="hover:text-white transition-colors">
                  Create Workspace
                </button>
              </li>
              <li className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Cloud Storage Ready</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-mono uppercase text-slate-300 font-semibold tracking-wider mb-3">
              Architecture & Trust
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Engineered with dark-first Apple design philosophy, high-contrast typography, and zero clutter.
            </p>
            <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-300">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Client-first privacy safeguards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
