import React from 'react';
import { storageService, getRolePermissions } from '../services/storageService';
import { UserRole } from '../types';
import { generatePurchaseSuggestionsPdf } from '../utils/pdfGenerator';
import {
  AlertTriangle,
  ShoppingCart,
  Download,
  CheckCircle2,
  Package,
  TrendingDown,
  Building,
  DollarSign
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
}

export const PurchasingView: React.FC<Props> = ({ currentRole }) => {
  const perms = getRolePermissions(currentRole);
  const suggestions = storageService.getPurchaseSuggestions();
  const products = storageService.getProducts();

  const grandTotalHT = suggestions.reduce((acc, s) => acc + s.estimatedTotalHT, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Zéro Rupture Critique — Spécification 3.4</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Tableau de Bord d'Achat & Suggestions Fournisseurs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calcul automatique des besoins basé sur les seuils de sécurité paramétrés (ex: Papier A4 &lt; 50 cartons).
          </p>
        </div>

        <button
          onClick={() => generatePurchaseSuggestionsPdf(suggestions)}
          disabled={suggestions.length === 0}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black px-4 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Suggestion d'Achat PDF</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Articles Sous le Seuil Minimum
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {suggestions.length} <span className="text-xs font-normal text-slate-500">références</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Budget Réapprovisionnement Estimé HT
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {grandTotalHT.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">DH</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Notification Multi-Canaux
          </div>
          <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-2 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Alerte Quotidienne Responsable Achat Active</span>
          </div>
        </div>
      </div>

      {/* Reorder Suggestions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Tableau Récapitulatif des Commande Suggérées
          </h3>
          <span className="text-xs text-slate-500 font-mono">Génération automatique</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Fournisseur Suggéré</th>
                <th className="py-3 px-4">Article & SKU</th>
                <th className="py-3 px-4 text-center">Stock Actuel / Seuil Min</th>
                <th className="py-3 px-4 text-center">Quantité Suggérée</th>
                <th className="py-3 px-4">P.U Achat HT</th>
                <th className="py-3 px-4 text-right">Montant Total HT</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {suggestions.map(s => (
                <tr key={s.productId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Supplier */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{s.preferredSupplier}</span>
                    </div>
                  </td>

                  {/* Article */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.designation}</div>
                    <div className="text-[11px] text-blue-600 font-mono font-semibold">SKU: {s.sku}</div>
                  </td>

                  {/* Stock vs Min */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{s.currentStock} / {s.minStockThreshold} min</span>
                    </div>
                  </td>

                  {/* Suggested Qty */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-slate-900">
                    +{s.suggestedReorderQuantity}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {s.unitPurchasePriceHT.toLocaleString('fr-FR')} DH
                  </td>

                  {/* Total Line */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {s.estimatedTotalHT.toLocaleString('fr-FR')} DH
                  </td>
                </tr>
              ))}

              {suggestions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-900 text-xs">Aucun stock sous le seuil critique !</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Toutes les références sont au-dessus de leur seuil de sécurité.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
