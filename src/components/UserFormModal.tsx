import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, UserAccessRights } from '../types';
import { authService, DEFAULT_ROLE_RIGHTS } from '../services/authService';
import { storageService } from '../services/storageService';
import {
  X,
  User,
  Mail,
  Shield,
  KeyRound,
  Hash,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Settings2,
  Check,
  RotateCcw
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: AuthUser | null;
  onSaved: () => void;
}

export const UserFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userToEdit,
  onSaved
}) => {
  if (!isOpen) return null;

  const isEditing = !!userToEdit;

  const [fullName, setFullName] = useState(userToEdit?.fullName || '');
  const [username, setUsername] = useState(userToEdit?.username || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [role, setRole] = useState<UserRole>(userToEdit?.role || 'WAREHOUSE_AGENT');
  const [password, setPassword] = useState(userToEdit ? '' : 'pass123');
  const [pinCode, setPinCode] = useState(userToEdit?.pinCode || '');
  const [avatarUrl, setAvatarUrl] = useState(userToEdit?.avatarUrl || '');
  const [isActive, setIsActive] = useState(userToEdit?.isActive !== false);
  const [showPassword, setShowPassword] = useState(false);

  // Granular Access Rights
  const [rights, setRights] = useState<UserAccessRights>(
    userToEdit?.accessRights || { ...DEFAULT_ROLE_RIGHTS[role] }
  );

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When role changes on a new user (or if desired), suggest default role rights
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Suggest default rights for this role
    setRights({ ...DEFAULT_ROLE_RIGHTS[newRole] });
  };

  const handleToggleRight = (key: keyof UserAccessRights) => {
    setRights(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetToRoleDefaults = () => {
    setRights({ ...DEFAULT_ROLE_RIGHTS[role] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username.trim()) {
      setError('Le nom d\'utilisateur est obligatoire.');
      setIsSubmitting(false);
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Une adresse email valide est obligatoire.');
      setIsSubmitting(false);
      return;
    }

    if (!isEditing && (!password || password.length < 4)) {
      setError('Le mot de passe initial doit contenir au moins 4 caractères.');
      setIsSubmitting(false);
      return;
    }

    const payload: Partial<AuthUser> & {
      username: string;
      fullName: string;
      role: UserRole;
      email: string;
    } = {
      ...(userToEdit ? { id: userToEdit.id } : {}),
      fullName: fullName.trim() || username.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      role,
      pinCode: pinCode.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      isActive,
      accessRights: rights
    };

    if (password && password.trim()) {
      payload.passwordHash = password.trim();
    }

    const result = authService.saveUser(payload);
    setIsSubmitting(false);

    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Modifier l'Utilisateur : @${userToEdit?.username}` : 'Créer un Nouvel Utilisateur'}
              </h3>
              <p className="text-xs text-slate-400">
                Définition de l'identité, mot de passe et matrice des droits d'accès
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Informations Générales */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Informations d'Identité & Profil</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom Complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Tariq Benali"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Identifiant de Connexion (Login) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                  placeholder="ex: tariq_magasin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adresse Email Professionnelle <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tariq@distribution-it.ma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rôle de Référence Système <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">Administrateur Système (Accès Total)</option>
                  <option value="PURCHASE_MGR">Responsable Achats (PAMP & Fournisseurs)</option>
                  <option value="WAREHOUSE_AGENT">Agent Magasinier (Entrées/Sorties/Inventaires)</option>
                  <option value="SALES">Vendeur / Commercial (Consultation & Stock)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Authentification & Codes d'accès */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Sécurité & Authentification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isEditing ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe initial *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditing ? '••••••••' : 'Min. 4 caractères'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Code PIN Terminal (4 à 6 chiffres - Optionnel)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Compte Utilisateur Actif (autoriser les connexions)
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Matrice des Droits d'Accès Personnalisés */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. Droits d'Accès Détaillés (RBAC Granulaire)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cochez ou décochez les permissions spécifiques attribuées à cet utilisateur.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetToRoleDefaults}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rétablir par défaut ({role})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* 1. Consultation Stock */}
              <div
                onClick={() => handleToggleRight('canConsultStock')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canConsultStock
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canConsultStock ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canConsultStock && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Consultation Stock & Catalogue</div>
                  <div className="text-[10px] text-slate-500">Lecture des fiches articles, quantités et emplacements.</div>
                </div>
              </div>

              {/* 2. Création Mouvements BR/BL */}
              <div
                onClick={() => handleToggleRight('canCreateMovements')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canCreateMovements
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canCreateMovements ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canCreateMovements && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Saisie Mouvements (BR & BL)</div>
                  <div className="text-[10px] text-slate-500">Enregistrer des entrées réceptions et sorties expéditions.</div>
                </div>
              </div>

              {/* 3. Validation Inventaires */}
              <div
                onClick={() => handleToggleRight('canValidateInventory')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canValidateInventory
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canValidateInventory ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canValidateInventory && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Inventaires & Ajustements</div>
                  <div className="text-[10px] text-slate-500">Lancement des sessions d'audit et validation des écarts.</div>
                </div>
              </div>

              {/* 4. Consultation Prix d'Achat & Valorisation */}
              <div
                onClick={() => handleToggleRight('canViewPurchasePrices')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canViewPurchasePrices
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canViewPurchasePrices ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canViewPurchasePrices && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Prix d'Achat & Valorisation PAMP</div>
                  <div className="text-[10px] text-slate-500">Voir les prix fournisseurs et la valeur financière globale.</div>
                </div>
              </div>

              {/* 5. Gestion Fiches Articles */}
              <div
                onClick={() => handleToggleRight('canManageCatalog')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canManageCatalog
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canManageCatalog ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canManageCatalog && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Création / Modification Articles</div>
                  <div className="text-[10px] text-slate-500">Ajouter des références, générer codes-barres et S/N.</div>
                </div>
              </div>

              {/* 6. Gestion Fournisseurs */}
              <div
                onClick={() => handleToggleRight('canManageSuppliers')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canManageSuppliers
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canManageSuppliers ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canManageSuppliers && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Gestion Annuaire Fournisseurs</div>
                  <div className="text-[10px] text-slate-500">Ajouter, modifier ou évaluer les partenaires d'approvisionnement.</div>
                </div>
              </div>

              {/* 7. Gestion Utilisateurs & Droits */}
              <div
                onClick={() => handleToggleRight('canManageUsers')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canManageUsers
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canManageUsers ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canManageUsers && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Gestion Utilisateurs & Rôles</div>
                  <div className="text-[10px] text-slate-500">Créer des comptes d'accès et définir leurs permissions.</div>
                </div>
              </div>

              {/* 8. Exportation des Données */}
              <div
                onClick={() => handleToggleRight('canExportData')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  rights.canExportData
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                  rights.canExportData ? 'bg-blue-600 text-white' : 'border border-slate-400'
                }`}>
                  {rights.canExportData && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Exportation Données (Excel / JSON)</div>
                  <div className="text-[10px] text-slate-500">Télécharger les sauvegardes et rapports financiers.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les Modifications' : 'Créer l\'Utilisateur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
