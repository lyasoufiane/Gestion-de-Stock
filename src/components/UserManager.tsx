import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, UserAccessRights } from '../types';
import { authService, DEFAULT_USERS } from '../services/authService';
import { storageService } from '../services/storageService';
import { UserFormModal } from './UserFormModal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Check,
  Building2,
  Truck,
  Package,
  ArrowLeftRight,
  ClipboardList,
  DollarSign,
  AlertCircle,
  LogIn
} from 'lucide-react';

interface Props {
  onUserSwitched?: () => void;
}

export const UserManager: React.FC<Props> = ({ onUserSwitched }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  
  // Quick Reset Password Modal state
  const [passwordResetUser, setPasswordResetUser] = useState<AuthUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = authService.getUser();

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: AuthUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: AuthUser) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${user.fullName} (@${user.username}) ?`)) {
      const res = authService.deleteUser(user.id);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        loadUsers();
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    }
  };

  const handleToggleStatus = (user: AuthUser) => {
    const res = authService.toggleUserStatus(user.id);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      loadUsers();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleSwitchToUser = (user: AuthUser) => {
    if (!user.isActive) {
      alert('Ce compte est suspendu.');
      return;
    }
    // Perform simulated fast login for testing RBAC
    const res = authService.loginWithPassword(user.username, user.passwordHash || 'admin123', true);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: `Session basculée sur @${user.username} (${user.role})` });
      if (onUserSwitched) onUserSwitched();
      window.location.reload();
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;

    const res = authService.resetUserPassword(passwordResetUser.id, newPasswordInput);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setPasswordResetUser(null);
      setNewPasswordInput('');
      loadUsers();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleResetAllToDemo = () => {
    if (window.confirm('Voulez-vous réinitialiser tous les utilisateurs et leurs droits d\'accès aux 4 comptes de démonstration par défaut ?')) {
      authService.resetToDefaultUsers();
      loadUsers();
      setFeedbackMsg({ type: 'success', text: 'Comptes de démonstration réinitialisés !' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Administrateur</span>
          </span>
        );
      case 'PURCHASE_MGR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <DollarSign className="w-3 h-3 text-indigo-600" />
            <span>Resp. Achats</span>
          </span>
        );
      case 'WAREHOUSE_AGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Package className="w-3 h-3 text-amber-600" />
            <span>Magasinier Stock</span>
          </span>
        );
      case 'SALES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Users className="w-3 h-3 text-purple-600" />
            <span>Commercial</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administration des Comptes & Permissions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Gestion des Utilisateurs & Droits d'Accès
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Créez de nouveaux utilisateurs, attribuez des rôles opérationnels (Magasin, Achat, Vente, Admin) et personnalisez précisément la matrice de leurs privilèges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetAllToDemo}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Rétablir les 4 comptes de démonstration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Comptes Démo</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un Utilisateur</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Role Counts Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Utilisateurs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {users.filter(u => u.isActive).length} actifs
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase">Administrateurs</div>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {users.filter(u => u.role === 'ADMIN').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Accès Système Total</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase">Magasin & Stock</div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {users.filter(u => u.role === 'WAREHOUSE_AGENT').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Entrées / Sorties / Scan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-600 uppercase">Achats & Ventes</div>
          <div className="text-2xl font-black text-indigo-900 mt-1">
            {users.filter(u => u.role === 'PURCHASE_MGR' || u.role === 'SALES').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Gestion Commerciale</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur par nom, identifiant, email..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filtrer par rôle :</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les rôles ({users.length})</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="PURCHASE_MGR">Responsables Achats</option>
            <option value="WAREHOUSE_AGENT">Magasiniers Stock</option>
            <option value="SALES">Commerciaux</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Comptes Utilisateurs Enregistrés ({filteredUsers.length})</span>
          </h3>
          <span className="text-xs text-slate-500">
            Connecté : <strong className="text-blue-600">{currentUser.fullName}</strong> (@{currentUser.username})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Identifiant & Email</th>
                <th className="py-3 px-4">Rôle & Statut</th>
                <th className="py-3 px-4">Droits d'Accès Attribués</th>
                <th className="py-3 px-4">Sécurité (PIN)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser.id === u.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${!u.isActive ? 'bg-slate-50/40 opacity-70' : ''}`}>
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                            ) : (
                              u.fullName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 font-semibold text-[9px] rounded-md">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Créé le {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Login & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800">@{u.username}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>

                      {/* Role & Active Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div>{getRoleBadge(u.role)}</div>
                          <div>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isCurrent && u.isActive}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                                u.isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              }`}
                              title={u.isActive ? 'Cliquer pour suspendre' : 'Cliquer pour activer'}
                            >
                              {u.isActive ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                              <span>{u.isActive ? 'Actif' : 'Suspendu'}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Granular Rights Summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.accessRights?.canConsultStock && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-semibold rounded">
                              Stock
                            </span>
                          )}
                          {u.accessRights?.canCreateMovements && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-semibold rounded">
                              BR/BL
                            </span>
                          )}
                          {u.accessRights?.canValidateInventory && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-semibold rounded">
                              Inventaires
                            </span>
                          )}
                          {u.accessRights?.canViewPurchasePrices && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-semibold rounded">
                              PAMP
                            </span>
                          )}
                          {u.accessRights?.canManageSuppliers && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-semibold rounded">
                              Fournisseurs
                            </span>
                          )}
                          {u.accessRights?.canManageCatalog && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-semibold rounded">
                              Articles
                            </span>
                          )}
                          {u.accessRights?.canManageUsers && (
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-700 text-[9px] font-semibold rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Security PIN */}
                      <td className="py-3.5 px-4">
                        {u.pinCode ? (
                          <span className="font-mono font-bold text-slate-700 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            PIN: {u.pinCode}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Aucun PIN</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Login Switcher */}
                          {!isCurrent && u.isActive && (
                            <button
                              onClick={() => handleSwitchToUser(u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`Basculer immédiatement sur la session de @${u.username}`}
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Password Reset */}
                          <button
                            onClick={() => {
                              setPasswordResetUser(u);
                              setNewPasswordInput('');
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit User & Rights */}
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="Modifier l'utilisateur et ses droits"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer définitivement l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal (Add / Edit + Access Rights) */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={editingUser}
        onSaved={loadUsers}
      />

      {/* Quick Password Reset Modal */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Réinitialiser Mot de Passe</h4>
                <p className="text-xs text-slate-500">Pour @{passwordResetUser.username}</p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Min. 4 caractères"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-xs"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
