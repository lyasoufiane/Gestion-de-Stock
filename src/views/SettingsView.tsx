import React, { useState } from 'react';
import { UserRole } from '../types';
import { storageService, getRolePermissions } from '../services/storageService';
import { CompanyProfileEditor } from '../components/CompanyProfileEditor';
import { SupplierRegistryManager } from '../components/SupplierRegistryManager';
import {
  ShieldCheck,
  Warehouse,
  FileText,
  RotateCcw,
  Download,
  Upload,
  Check,
  X,
  Lock,
  History,
  Building2,
  Truck
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

type SettingsSubTab = 'company' | 'suppliers' | 'rbac';

export const SettingsView: React.FC<Props> = ({ currentRole, onRoleChange }) => {
  const perms = getRolePermissions(currentRole);
  const logs = storageService.getAuditLogs();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('company');
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
          <span>Droits RBAC & Journal d'Audit</span>
        </button>
      </div>

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
                Gestion des rôles utilisateurs (Section 5), entrepôts et journal d'audit de sécurité.
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

          {/* RBAC MATRIX TABLE FROM SECTION 5 OF CAHIER DES CHARGES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Matrice des Rôles & Droits d'Accès (Spécification Section 5)
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
                  <tr className={currentRole === 'ADMIN' ? 'bg-blue-50/50 font-semibold' : ''}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">Administrateur</td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                  </tr>

                  <tr className={currentRole === 'PURCHASE_MGR' ? 'bg-blue-50/50 font-semibold' : ''}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">Responsable Achat</td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">NON</span></td>
                  </tr>

                  <tr className={currentRole === 'WAREHOUSE_AGENT' ? 'bg-blue-50/50 font-semibold' : ''}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">Magasinier / Agent Stock</td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">SAISIE SEULE</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">NON</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">NON</span></td>
                  </tr>

                  <tr className={currentRole === 'SALES' ? 'bg-blue-50/50 font-semibold' : ''}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">Vendeur / Commercial</td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">OUI</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">LECTURE SEULE</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">NON</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">PRIX VENTE SEUL</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">NON</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Audit Trail Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <History className="w-4 h-4 text-blue-600" />
                <span>Journal d'Audit de Sécurité (Audit Log)</span>
              </div>
              <span className="text-xs text-slate-500">{logs.length} événements enregistrés</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="p-3.5 px-6 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 font-mono text-[11px]">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-800">{log.userName}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">
                    {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

