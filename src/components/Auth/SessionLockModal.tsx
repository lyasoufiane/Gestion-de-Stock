import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { Lock, KeyRound, ArrowRight, AlertCircle, ShieldAlert, LogOut } from 'lucide-react';

interface SessionLockModalProps {
  isOpen: boolean;
  onUnlocked: () => void;
  onLogout: () => void;
}

export const SessionLockModal: React.FC<SessionLockModalProps> = ({
  isOpen,
  onUnlocked,
  onLogout
}) => {
  if (!isOpen) return null;

  const user = authService.getUser();
  const profile = storageService.getCompanyProfile();
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = authService.unlockSession(credential);
    if (success) {
      setCredential('');
      onUnlocked();
    } else {
      setError('Mot de passe ou code PIN incorrect.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
        <div className="relative mx-auto w-16 h-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Lock className="w-8 h-8" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <ShieldAlert className="w-3 h-3 text-slate-950 font-bold" />
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Session Verrouillée</h3>
          <p className="text-xs text-slate-400 mt-1">
            Connecté en tant que <span className="text-blue-300 font-semibold">{user.fullName}</span> ({user.username})
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              autoFocus
              required
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="Mot de passe ou Code PIN"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <span>Déverrouiller la session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-center">
          <button
            type="button"
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Changer d'utilisateur / Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
