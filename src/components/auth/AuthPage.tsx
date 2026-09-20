import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseAuthErrorMessage } from '../../lib/authErrors';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export type AuthViewMode = 'login' | 'signup' | 'forgot_password';

interface AuthPageProps {
  initialMode?: AuthViewMode;
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onBackToLanding,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendResetEmail } = useAuth();

  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
  }>({});

  // Reset errors when switching modes
  const switchMode = (newMode: AuthViewMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
    setValidationErrors({});
  };

  // Form Validation logic
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (mode === 'forgot_password') {
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        errors.displayName = 'Full name is required.';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle standard Email/Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onSuccess();
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        onSuccess();
      } else if (mode === 'forgot_password') {
        await sendResetEmail(email);
        setResetSuccessMessage(
          `A password reset link has been dispatched to ${email}. Please check your inbox and spam folder.`
        );
      }
    } catch (err: any) {
      const code = err?.code || '';
      const message = getFirebaseAuthErrorMessage(code);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      const code = err?.code || '';
      if (code !== 'auth/popup-closed-by-user') {
        setErrorMessage(getFirebaseAuthErrorMessage(code));
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div
      id="peak-auth-page"
      className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-blue-500/30 selection:text-white"
    >
      {/* Dynamic ambient optical glow */}
      <div className="fixed top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-blue-900/15 blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[15%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[180px] pointer-events-none -z-10" />
      <div className="fixed top-[45%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-950/15 blur-[170px] pointer-events-none -z-10" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer p-2 rounded-xl hover:bg-white/[0.04]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToLanding}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Zap className="w-4 h-4 text-white fill-white/20" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Peak Day</span>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="w-full max-w-md mx-auto px-4 py-8 relative z-10 flex-1 flex items-center justify-center">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full p-8 sm:p-9 rounded-3xl glass-surface-elevated border border-white/[0.12] shadow-2xl shadow-blue-950/70 backdrop-blur-2xl relative overflow-hidden"
          style={{
            boxShadow:
              '0 25px 50px -12px rgba(5, 12, 30, 0.75), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />

          {/* Mode Title & Context */}
          <div className="text-center mb-7">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-[#090C15] flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400 fill-blue-400/30" />
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' && 'Welcome back to Peak Day'}
              {mode === 'signup' && 'Create your Peak Day account'}
              {mode === 'forgot_password' && 'Reset your password'}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {mode === 'login' && 'Sign in to access your daily tasks, academics, and fitness OS.'}
              {mode === 'signup' && 'Unify your routine, workouts, and study blocks under one brain.'}
              {mode === 'forgot_password' && 'Enter your registered email address to receive reset instructions.'}
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Banner (for Password Reset) */}
          <AnimatePresence>
            {resetSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{resetSuccessMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign-In Option (only on Login & Signup) */}
          {mode !== 'forgot_password' && (
            <>
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGoogleSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0D111E] px-3 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                    Or with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name field (Signup only) */}
            {mode === 'signup' && (
              <div>
                <Input
                  id="auth-name-input"
                  label="Full Name"
                  placeholder="Alex Morgan"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (validationErrors.displayName) {
                      setValidationErrors((prev) => ({ ...prev, displayName: undefined }));
                    }
                  }}
                  leftIcon={<User className="w-4 h-4" />}
                  error={validationErrors.displayName}
                  required
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <Input
                id="auth-email-input"
                label="Email Address"
                type="email"
                placeholder="alex@stanford.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                error={validationErrors.email}
                required
              />
            </div>

            {/* Password (Login & Signup) */}
            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot_password')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={validationErrors.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div>
                <Input
                  id="auth-confirm-password-input"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={validationErrors.confirmPassword}
                  required
                />
              </div>
            )}

            {/* Submit CTA Button */}
            <Button
              id="auth-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 shadow-lg shadow-blue-600/30"
              isLoading={isSubmitting}
              rightIcon={mode !== 'forgot_password' ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {mode === 'login' && 'Sign In to Peak Day'}
              {mode === 'signup' && 'Create Free Account'}
              {mode === 'forgot_password' && 'Send Password Reset Link'}
            </Button>
          </form>

          {/* Mode Switcher Navigation Links */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs">
            {mode === 'login' && (
              <p className="text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  id="switch-to-signup-btn"
                  onClick={() => switchMode('signup')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Sign up free
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-slate-400">
                Already have a Peak Day account?{' '}
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => switchMode('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot_password' && (
              <p className="text-slate-400">
                Remember your credentials?{' '}
                <button
                  type="button"
                  id="switch-to-login-from-forgot-btn"
                  onClick={() => switchMode('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Return to sign in
                </button>
              </p>
            )}
          </div>

          {/* Firebase Security Footer Note */}
          <div className="flex items-center justify-center gap-1.5 pt-4 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted with Firebase Authentication</span>
          </div>
        </motion.div>
      </main>

      {/* Mini footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 font-mono">
        © 2026 Peak Day OS. Personal Operating System for High Performers.
      </footer>
    </div>
  );
};
