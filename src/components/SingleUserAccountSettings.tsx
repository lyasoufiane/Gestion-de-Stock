import React, { useState } from 'react';
import { authService, DEFAULT_USERS } from '../services/authService';
import { storageService } from '../services/storageService';
import {
  User,
  ShieldCheck,
  KeyRound,
  Hash,
  History,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Shield
} from 'lucide-react';

interface Props {
  onLogout?: () => void;
  onLock?: () => void;
}

export const SingleUserAccountSettings: React.FC<Props> = ({ onLogout, onLock }) => {
  const user = authService.getUser();
  const loginLogs = authService.getLoginHistory();

  // Profile Form state
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // PIN Form state
  const [newPin, setNewPin] = useState(user.pinCode || '');

  // Messages
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const res = authService.updateProfile({
      fullName,
      username,
      email,
      avatarUrl
    });

    if (res.success) {
      setProfileMsg({ type: 'success', text: res.message });
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg({ type: 'error', text: res.message });
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    const res = authService.changePassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);

    const res = authService.changePin(newPin);
    if (res.success) {
      setPinMsg({ type: 'success', text: res.message });
      setTimeout(() => setPinMsg(null), 3000);
    } else {
      setPinMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-0.5 shadow-md overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {storageService.getRoleName(user.role)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifiant : <span className="font-mono text-blue-300">@{username}</span> • Email : <span className="text-slate-300">{email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLock && (
            <button
              onClick={onLock}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Verrouiller session</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-500/30 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          )}
        </div>
      </div>

      {/* Mes Droits d'Accès Actuels */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Mes Droits d'Accès Actifs sur la Plateforme</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canConsultStock ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Consultation Stock</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canCreateMovements ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Entrées BR & Sorties BL</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canValidateInventory ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Inventaires & Audits</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canViewPurchasePrices ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Prix d'Achat (PAMP)</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canManageSuppliers ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Gestion Fournisseurs</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canManageCatalog ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Gestion Articles & S/N</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canManageUsers ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Gestion Utilisateurs</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            user.accessRights?.canExportData ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Export JSON / Excel</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Profil & Identifiants Généraux */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Mon Profil & Identifiants
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">{storageService.getRoleName(user.role)}</span>
          </div>

          {profileMsg && (
            <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom complet affiché</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Tariq Benali"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom d'utilisateur (Login)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email professionnel</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@distribution-it.ma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Avatar / Photo de profil (Optionnel)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Mettre à jour le profil</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Modification Mot de Passe & Code PIN */}
        <div className="space-y-6">
          {/* Mot de Passe */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Changer mon Mot de Passe
              </h3>
            </div>

            {passwordMsg && (
              <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nouveau mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 4 caractères"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirmer nouveau</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répéter mot de passe"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enregistrer le mot de passe</span>
                </button>
              </div>
            </form>
          </div>

          {/* Code PIN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Code PIN de Déverrouillage Rapide
                  </h3>
                  <p className="text-[11px] text-slate-500">Pour terminaux de stock / douchette</p>
                </div>
              </div>
            </div>

            {pinMsg && (
              <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                pinMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {pinMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{pinMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Code PIN (4-6 chiffres)"
                  className="w-48 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>Mettre à jour le PIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Audit Log des connexions récentes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Historique des Tentatives de Connexion Récentes
              </h3>
              <p className="text-[11px] text-slate-500">Journal d'audit de sécurité des sessions</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Identifiant Saisi</th>
                <th className="py-2.5 px-3">Méthode</th>
                <th className="py-2.5 px-3">Type Appareil</th>
                <th className="py-2.5 px-3 text-right">Résultat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loginLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {log.identifier}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                      {log.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {log.userAgent}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Réussi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Refusé</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
