import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
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
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseAuthErrorMessage } from '../../lib/authErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot_password';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendResetEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  }, [initialMode, isOpen]);

  const handleModeChange = (newMode: 'login' | 'signup' | 'forgot_password') => {
    setMode(newMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'forgot_password') {
      setIsLoading(true);
      try {
        await sendResetEmail(emailTrimmed);
        setResetSuccessMessage(`Password reset link sent to ${emailTrimmed}.`);
      } catch (err: any) {
        setErrorMessage(getFirebaseAuthErrorMessage(err?.code || ''));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(emailTrimmed, password);
      } else {
        await signUpWithEmail(emailTrimmed, password, name);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(getFirebaseAuthErrorMessage(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(getFirebaseAuthErrorMessage(err?.code || ''));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      id="auth-modal"
    >
      <div className="p-1">
        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-[#090C15] flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400/30" />
            </div>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' && 'Welcome back to Peak Day'}
            {mode === 'signup' && 'Create your Peak Day account'}
            {mode === 'forgot_password' && 'Reset your password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access your unified student & fitness operating system.'}
            {mode === 'signup' && 'Begin orchestrating your optimal daily routine.'}
            {mode === 'forgot_password' && 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password reset success feedback */}
        <AnimatePresence>
          {resetSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{resetSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Authentication Button */}
        {mode !== 'forgot_password' && (
          <>
            <button
              type="button"
              id="modal-google-btn"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0B0E18] px-2 text-slate-400 font-mono text-[10px] uppercase">
                  Or with email
                </span>
              </div>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <Input
              id="modal-name-input"
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
          )}

          <Input
            id="modal-email-input"
            label="Email Address"
            type="email"
            placeholder="alex@stanford.edu"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot_password')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="modal-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
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

          <Button
            id="modal-auth-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 shadow-lg shadow-blue-600/30"
            isLoading={isLoading}
            rightIcon={mode !== 'forgot_password' ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {mode === 'login' && 'Sign In to Peak Day'}
            {mode === 'signup' && 'Create Free Account'}
            {mode === 'forgot_password' && 'Send Reset Email'}
          </Button>

          {/* Switch Mode Footer */}
          <div className="text-center pt-3 border-t border-white/[0.06]">
            {mode === 'login' && (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  id="modal-switch-to-signup"
                  onClick={() => handleModeChange('signup')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Sign up free
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-xs text-slate-400">
                Already have a Peak Day account?{' '}
                <button
                  type="button"
                  id="modal-switch-to-login"
                  onClick={() => handleModeChange('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot_password' && (
              <p className="text-xs text-slate-400">
                Remember your credentials?{' '}
                <button
                  type="button"
                  id="modal-switch-to-login-from-reset"
                  onClick={() => handleModeChange('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>

          {/* Firebase Protection Note */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Secured with Firebase Authentication</span>
          </div>
        </form>
      </div>
    </Modal>
  );
};
