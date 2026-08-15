import React, { useState } from 'react';
import { UserRole } from '../types';
import { storageService, getRolePermissions } from '../services/storageService';
import { authService } from '../services/authService';
import { CompanyProfileEditor } from '../components/CompanyProfileEditor';
import { SupplierRegistryManager } from '../components/SupplierRegistryManager';
import { SingleUserAccountSettings } from '../components/SingleUserAccountSettings';
import { UserManager } from '../components/UserManager';
import { WarehouseManager } from '../components/WarehouseManager';
import {
  ShieldCheck,
  RotateCcw,
  Download,
  Upload,
  UserCheck,
  Building2,
  Truck,
  KeyRound,
  Users,
  Shield,
  Warehouse as WarehouseIcon
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout?: () => void;
  onLock?: () => void;
}

export type SettingsSubTab = 'users' | 'account' | 'warehouses' | 'company' | 'suppliers' | 'rbac';

export const SettingsView: React.FC<Props> = ({ currentRole, onRoleChange, onLogout, onLock }) => {
  const perms = getRolePermissions(currentRole);
  const logs = storageService.getAuditLogs();
  const currentUser = authService.getUser();
  const canManageUsers = currentUser.role === 'ADMIN' || !!currentUser.accessRights?.canManageUsers;

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(
    canManageUsers ? 'users' : 'account'
  );
  const [importStatus, setImportStatus] = useState('');

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes les données de stock, numéros de série et mouvements aux valeurs d\'origine ?')) {
      storageService.resetToDefaults();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const jsonStr = storageService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IT_Stock_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (storageService.importJSON(content)) {
        setImportStatus('Données importées avec succès !');
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        setImportStatus('Erreur lors du format du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {canManageUsers && (
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion des Utilisateurs & Droits</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('account')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'account'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Mon Profil & Mot de Passe</span>
        </button>

        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'warehouses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          <span>Dépôts & Entrepôts (Multi-Emplacements)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('company')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'company'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Informations Fournisseur / Société</span>
        </button>

        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Annuaire Fournisseurs Partenaires</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'rbac'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matrice Rôles & Journal d'Audit</span>
        </button>
      </div>

      {activeSubTab === 'users' && canManageUsers && (
        <UserManager />
      )}

      {activeSubTab === 'account' && (
        <SingleUserAccountSettings onLogout={onLogout} onLock={onLock} />
      )}

      {activeSubTab === 'warehouses' && (
        <WarehouseManager />
      )}

      {activeSubTab === 'company' && (
        <CompanyProfileEditor />
      )}

      {activeSubTab === 'suppliers' && (
        <SupplierRegistryManager />
      )}

      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Matrice RBAC & Configuration Système</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Droits d'Accès & Paramètres Système
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gestion des privilèges utilisateurs, entrepôts et journal d'audit de sécurité.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exporter JSON</span>
              </button>

              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Importer Backup</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-500/30 cursor-pointer transition-colors"
                title="Réinitialiser les données de démonstration"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Réinitialiser Démarrage</span>
              </button>
            </div>
          </div>

          {importStatus && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-medium">
              {importStatus}
            </div>
          )}

          {/* RBAC MATRIX TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Matrice des Rôles & Droits d'Accès Standard
              </h3>
              <span className="text-xs text-slate-500">Rôle Actif: <span className="font-bold text-blue-600">{storageService.getRoleName(currentRole)}</span></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Rôle Utilisateur</th>
                    <th className="py-3 px-4 text-center">Consultation Stock</th>
                    <th className="py-3 px-4 text-center">Entrée / Sortie (BR/BL)</th>
                    <th className="py-3 px-4 text-center">Validation Inventaire</th>
                    <th className="py-3 px-4 text-center">Gestion Prix / Achat</th>
                    <th className="py-3 px-4 text-center">Admin Système</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr className={currentRole === 'ADMIN' ? 'bg-blue-50/60 font-semibold' : ''}>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>Administrateur (ADMIN)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">TOTAL</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">TOTAL (BR + BL)</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">OUI (Écarts & Clôture)</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">TOTAL (PAMP + Vente)</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">OUI (Tous droits)</td>
                  </tr>

                  <tr className={currentRole === 'PURCHASE_MGR' ? 'bg-indigo-50/60 font-semibold' : ''}>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <span>Responsable Achats (PURCHASE_MGR)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">TOTAL</td>
                    <td className="py-3 px-4 text-center text-indigo-600 font-semibold">Réception BR & Réappro</td>
                    <td className="py-3 px-4 text-center text-slate-400">Consultation</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">TOTAL (Fournisseurs & PAMP)</td>
                    <td className="py-3 px-4 text-center text-slate-400">NON</td>
                  </tr>

                  <tr className={currentRole === 'WAREHOUSE_AGENT' ? 'bg-amber-50/60 font-semibold' : ''}>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      <span>Agent Magasinier (WAREHOUSE_AGENT)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">TOTAL (Qte & Emplacements)</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">Saisie BR/BL & S/N</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-semibold">Saisie Comptage Uniquement</td>
                    <td className="py-3 px-4 text-center text-slate-400">NON (Prix Masqués)</td>
                    <td className="py-3 px-4 text-center text-slate-400">NON</td>
                  </tr>

                  <tr className={currentRole === 'SALES' ? 'bg-purple-50/60 font-semibold' : ''}>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                      <span>Vendeur / Commercial (SALES)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">Disponible Vente</td>
                    <td className="py-3 px-4 text-center text-slate-400">Lecture Seule</td>
                    <td className="py-3 px-4 text-center text-slate-400">NON</td>
                    <td className="py-3 px-4 text-center text-purple-600 font-semibold">Prix Public Vente HT</td>
                    <td className="py-3 px-4 text-center text-slate-400">NON</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Journal d'Audit Système & Traçabilité des Actions
              </h3>
              <span className="text-xs text-slate-500 font-mono">{logs.length} Événements enregistrés</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-4">Date / Heure</th>
                    <th className="py-2.5 px-4">Utilisateur</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Détails de l'opération</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {log.userName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
