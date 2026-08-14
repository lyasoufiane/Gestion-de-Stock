import React, { useState } from 'react';
import { InventoryAudit, UserRole, ProductCategory, InventoryAuditItem } from '../types';
import { storageService, getRolePermissions } from '../services/storageService';
import { generateInventoryPdf } from '../utils/pdfGenerator';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Barcode,
  Save,
  X,
  UserCheck
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onOpenScanner: () => void;
}

export const InventoryView: React.FC<Props> = ({ currentRole, onOpenScanner }) => {
  const perms = getRolePermissions(currentRole);
  const [activeAudit, setActiveAudit] = useState<InventoryAudit | null>(null);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);

  // New Audit State
  const [title, setTitle] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'ALL'>('ALL');

  const audits = storageService.getAudits();
  const products = storageService.getProducts();

  const handleStartNewAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const filteredProds = products.filter(p => categoryFilter === 'ALL' || p.category === categoryFilter);

    const auditItems: InventoryAuditItem[] = filteredProds.map(p => ({
      productId: p.id,
      productSku: p.sku,
      productDesignation: p.designation,
      category: p.category,
      theoreticalStock: p.currentStockQuantity,
      physicalStock: p.currentStockQuantity, // default same
      difference: 0
    }));

    const newAudit = storageService.saveAudit({
      title,
      categoryFilter,
      items: auditItems,
      auditorName: storageService.getRoleName(currentRole)
    });

    setActiveAudit(newAudit);
    setIsNewAuditOpen(false);
  };

  const handlePhysicalCountChange = (productId: string, val: number) => {
    if (!activeAudit) return;

    const updatedItems = activeAudit.items.map(item => {
      if (item.productId === productId) {
        const diff = val - item.theoreticalStock;
        return {
          ...item,
          physicalStock: val,
          difference: diff
        };
      }
      return item;
    });

    const updatedAudit = { ...activeAudit, items: updatedItems };
    setActiveAudit(updatedAudit);
    storageService.saveAudit(updatedAudit);
  };

  const handleJustificationChange = (productId: string, text: string) => {
    if (!activeAudit) return;

    const updatedItems = activeAudit.items.map(item => {
      if (item.productId === productId) {
        return { ...item, justification: text };
      }
      return item;
    });

    const updatedAudit = { ...activeAudit, items: updatedItems };
    setActiveAudit(updatedAudit);
    storageService.saveAudit(updatedAudit);
  };

  const handleCloseAndApplyAudit = () => {
    if (!activeAudit) return;

    // Check if any negative difference lacks mandatory justification
    const missingJustification = activeAudit.items.some(
      i => i.difference !== 0 && (!i.justification || i.justification.trim() === '')
    );

    if (missingJustification) {
      alert('Saisie obligatoire : Vous devez renseigner une justification (ex: vol, casse, perte, erreur) pour chaque écart constaté !');
      return;
    }

    if (window.confirm('Voulez-vous vraiment clôturer cet inventaire et appliquer le rapprochement de stock physique ?')) {
      storageService.completeAudit(activeAudit.id);
      setActiveAudit(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gestion des Inventaires & Réajustements</h2>
          <p className="text-xs text-slate-500">
            Inventaire Général ou Tournant par catégorie, saisie sur douchette et rapprochement d'écarts
          </p>
        </div>

        {perms.validateInventory !== 'NONE' && (
          <button
            onClick={() => {
              setTitle(`Inventaire Tournant - ${new Date().toLocaleDateString('fr-FR')}`);
              setIsNewAuditOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lancer un Inventaire</span>
          </button>
        )}
      </div>

      {/* Active Audit Session View */}
      {activeAudit && (
        <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-lg overflow-hidden p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase font-mono">
                  {activeAudit.reference} — EN COURS DE COMPTAGE
                </span>
                <span className="text-xs text-slate-500 font-mono">Date: {activeAudit.date}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{activeAudit.title}</h3>
              <p className="text-xs text-slate-500">
                Opérateur: {activeAudit.auditorName} | Filtre: {activeAudit.categoryFilter}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
              >
                <Barcode className="w-4 h-4 text-amber-400" />
                <span>Scan Douchette</span>
              </button>

              <button
                onClick={() => generateInventoryPdf(activeAudit)}
                className="flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-3.5 py-2 rounded-xl cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Rapport PDF</span>
              </button>

              {perms.validateInventory === 'FULL' && (
                <button
                  onClick={handleCloseAndApplyAudit}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Clôturer Rapprochement</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of items being counted */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Article / SKU</th>
                  <th className="py-2.5 px-3 text-center">Stock Théorique</th>
                  <th className="py-2.5 px-3 text-center">Comptage Physique *</th>
                  <th className="py-2.5 px-3 text-center">Écart Constaté</th>
                  <th className="py-2.5 px-3">Justification Obligatoire si Écart</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {activeAudit.items.map(item => {
                  const hasDiff = item.difference !== 0;

                  return (
                    <tr key={item.productId} className={`hover:bg-slate-50 transition-colors ${hasDiff ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.productDesignation}</div>
                        <div className="text-[11px] text-blue-600 font-mono font-semibold">{item.productSku}</div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {item.theoreticalStock}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={item.physicalStock}
                          onChange={e => handlePhysicalCountChange(item.productId, parseInt(e.target.value) || 0)}
                          className="w-20 text-center bg-white border-2 border-blue-500 rounded-lg px-2 py-1 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                        {item.difference === 0 ? (
                          <span className="text-emerald-600">0</span>
                        ) : item.difference > 0 ? (
                          <span className="text-blue-600">+{item.difference}</span>
                        ) : (
                          <span className="text-red-600">{item.difference}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.justification || ''}
                          onChange={e => handleJustificationChange(item.productId, e.target.value)}
                          placeholder={hasDiff ? "Motif obligatoire: vol, casse, perte, erreur..." : "Aucun écart"}
                          className={`w-full text-xs rounded-lg px-2.5 py-1.5 border ${
                            hasDiff && (!item.justification || item.justification.trim() === '')
                              ? 'border-red-500 bg-red-50 font-bold placeholder-red-400'
                              : 'border-slate-300 bg-white'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Audits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Historique des Inventaires & Rapprochements</h3>
          <span className="text-xs text-slate-500">{audits.length} inventaires enregistrés</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {audits.map(a => (
            <div key={a.id} className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{a.reference}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {a.status === 'COMPLETED' ? 'CLÔTURÉ' : 'EN COURS'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-1">{a.title}</h4>
                <p className="text-[11px] text-slate-500">Auditeur: {a.auditorName} | Date: {a.date}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateInventoryPdf(a)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Télécharger PDF Rapport"
                >
                  <Download className="w-4 h-4" />
                </button>

                {a.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => setActiveAudit(a)}
                    className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Reprendre Comptage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal New Audit */}
      {isNewAuditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">Démarrer une Session d'Inventaire</h3>
              <button onClick={() => setIsNewAuditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartNewAudit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Intitulé / Titre de l'Inventaire *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ex: Inventaire Tournant Toners HP - Août 2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Périmètre / Filtre de Catégorie</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="ALL">Tous les articles (Inventaire Général)</option>
                  <option value="Matériel Identifiable">Matériel Identifiable uniquement</option>
                  <option value="Consommables & Fournitures">Consommables & Fournitures uniquement</option>
                  <option value="Accessoires & Connectique">Accessoires & Connectique uniquement</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAuditOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-medium rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Lancer la Saisie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
