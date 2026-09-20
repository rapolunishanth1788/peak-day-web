import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  onOpenProfile?: () => void;
  onLogoutSuccess?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenProfile, onLogoutSuccess }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Athlete');
  const userEmail = user?.email || 'authenticated-user@peakday.app';
  const initial = (displayName.charAt(0) || 'P').toUpperCase();
  const photoURL = user?.photoURL;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        id="user-profile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer group"
      >
        <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#07090E]" />
        </div>

        <span className="hidden sm:inline text-xs font-medium text-slate-200 group-hover:text-white max-w-[100px] truncate">
          {displayName}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0C101C] border border-white/[0.12] shadow-2xl shadow-black/80 py-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Account
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Firebase Auth</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1 space-y-0.5">
            {onOpenProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors text-left cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span>Account Profile</span>
              </button>
            )}

            <div className="my-1 border-t border-white/[0.06]" />

            <button
              type="button"
              id="logout-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
