import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { authService, DEFAULT_USERS } from '../services/authService';
import { storageService } from '../services/storageService';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowRight,
  Warehouse,
  Users,
  Package,
  DollarSign
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const profile = storageService.getCompanyProfile();
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'PIN'>('PASSWORD');
  const [availableUsers, setAvailableUsers] = useState<AuthUser[]>([]);
  
  // Password Mode state
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // PIN Mode state
  const [pinCode, setPinCode] = useState('');

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAvailableUsers(authService.getUsers());
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.loginWithPassword(identifier, password, rememberMe);
      if (result.success) {
        setSuccessMessage(`Authentification réussie pour ${result.user?.fullName}. Chargement...`);
        setTimeout(() => {
          onLoginSuccess();
        }, 400);
      } else {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    }, 250);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.loginWithPin(pinCode, rememberMe);
      if (result.success) {
        setSuccessMessage(`Code PIN vérifié (${result.user?.fullName}). Accès autorisé...`);
        setTimeout(() => {
          onLoginSuccess();
        }, 400);
      } else {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    }, 250);
  };

  const handleSelectUserQuick = (user: AuthUser) => {
    setIdentifier(user.username);
    setPassword(user.passwordHash || 'admin123');
    setPinCode(user.pinCode || '');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 border border-blue-400/30 p-2 mx-auto">
            {profile.logoUrl && profile.logoUrl.startsWith('data:image') ? (
              <img
                src={profile.logoUrl}
                alt="Logo"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <Warehouse className="w-9 h-9 text-white" />
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              {profile.name || 'GESTION DE STOCK IT'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Authentification Multi-Utilisateurs & Contrôle d'Accès (RBAC)
            </p>
          </div>
        </div>

        {/* Authentication Card Form */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tab Switcher: Password vs PIN */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('PASSWORD');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'PASSWORD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Identifiant & MdP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('PIN');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'PIN'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Code PIN Rapide</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-950/70 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="font-medium">{successMessage}</div>
            </div>
          )}

          {/* Mode 1: Identifier + Password */}
          {authMode === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Identifiant ou Adresse Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin, tariq_magasin, etc."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mot de passe
                  </label>
                  <span className="text-[10px] text-slate-400">Accès Sécurisé</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-300 font-medium">Se souvenir de moi</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Vérification des droits...</span>
                ) : (
                  <>
                    <span>Connexion à l'Espace Stock</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Quick PIN Code */}
          {authMode === 'PIN' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <p className="text-xs text-slate-300 font-semibold">
                  Saisissez votre code PIN utilisateur
                </p>
                <p className="text-[11px] text-slate-400">
                  Déverrouillage instantané sur terminal ou douchette
                </p>
              </div>

              <div>
                <div className="relative max-w-[200px] mx-auto">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[0.6em] text-lg font-mono font-black bg-slate-950 border border-slate-700/80 rounded-xl py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-300 font-medium">Garder la session ouverte</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || pinCode.length < 4}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Validation du code PIN...</span>
                ) : (
                  <>
                    <span>Valider le PIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-click test accounts bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Rapide des Rôles & Droits :</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {availableUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUserQuick(u)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    identifier === u.username
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{u.fullName.split(' ')[0]}</div>
                  <div className="text-[9px] text-blue-400 font-mono">@{u.username}</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">{u.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Regulatory Footnote */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Contrôle RBAC Actif</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Warehouse className="w-3.5 h-3.5 text-blue-400" />
            <span>Traçabilité S/N & Mouvements</span>
          </span>
        </div>
      </div>
    </div>
  );
};
