import React, { useState } from 'react';
import { MovementType, StockMovement, UserRole, MovementItem, Supplier } from '../types';
import { storageService, getRolePermissions } from '../services/storageService';
import { generateMovementPdf } from '../utils/pdfGenerator';
import { QuickAddSupplierModal } from '../components/QuickAddSupplierModal';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Truck,
  User,
  Barcode,
  Package
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onOpenScanner: () => void;
}

export const MovementsView: React.FC<Props> = ({ currentRole, onOpenScanner }) => {
  const perms = getRolePermissions(currentRole);
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'ENTREE_BR' | 'SORTIE_BL'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);

  // New Movement Form state
  const [type, setType] = useState<MovementType>('ENTREE_BR');
  const [reference, setReference] = useState('');
  const [partyName, setPartyName] = useState('');
  const [varianceNotes, setVarianceNotes] = useState('');
  const [items, setItems] = useState<MovementItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Item line form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPriceHT, setItemPriceHT] = useState(0);
  const [itemSNsInput, setItemSNsInput] = useState('');
  const [itemLotInput, setItemLotInput] = useState('');

  const movements = storageService.getMovements();
  const products = storageService.getProducts();
  const suppliers = storageService.getSuppliers();

  const filteredMovements = movements.filter(m => {
    if (movementFilter === 'ALL') return true;
    return m.type === movementFilter;
  });

  const handleOpenCreate = (movType: MovementType) => {
    setType(movType);
    const count = movements.filter(m => m.type === movType).length + 1;
    const prefix = movType === 'ENTREE_BR' ? 'BR-2026-' : 'BL-2026-';
    setReference(`${prefix}${String(count).padStart(3, '0')}`);
    setPartyName(movType === 'ENTREE_BR' ? 'Disway Maroc' : 'Client OCP SA');
    setVarianceNotes('');
    setItems([]);
    setErrorMsg('');
    setIsCreateOpen(true);
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setItemPriceHT(type === 'ENTREE_BR' ? prod.pricing.purchasePriceHT : prod.pricing.publicSellingPriceHT);
    }
  };

  const handleAddItemLine = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    let sns: string[] = [];
    if (prod.trackingType === 'SERIAL_NUMBER') {
      sns = itemSNsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (sns.length === 0) {
        setErrorMsg('Veuillez saisir au moins un numéro de série S/N pour cet équipement haute valeur.');
        return;
      }

      // ANTI-ERROR VALIDATION for Sorties BL: Block if S/N is NOT in stock!
      if (type === 'SORTIE_BL') {
        for (const sn of sns) {
          const serialObj = storageService.getSerialBySN(sn);
          if (!serialObj || serialObj.status !== 'IN_STOCK') {
            setErrorMsg(`Erreur Anti-Erreur Expédition : Le S/N "${sn}" n'est pas disponible en stock (Statut: ${serialObj?.status || 'Inexistant'}). Expédition bloquée !`);
            return;
          }
        }
      }
    }

    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        productSku: prod.sku,
        productDesignation: prod.designation,
        quantity: prod.trackingType === 'SERIAL_NUMBER' ? sns.length : itemQty,
        unitPriceHT: itemPriceHT,
        serialNumbers: sns.length > 0 ? sns : undefined,
        lotNumber: itemLotInput ? itemLotInput : undefined
      }
    ]);

    // Reset line fields
    setSelectedProductId('');
    setItemQty(1);
    setItemSNsInput('');
    setItemLotInput('');
    setErrorMsg('');
  };

  const handleRemoveLine = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Veuillez ajouter au moins un article à ce bon.');
      return;
    }
    if (!partyName.trim()) {
      setErrorMsg('Veuillez indiquer le nom du fournisseur ou client.');
      return;
    }

    storageService.createMovement({
      type,
      reference,
      date: new Date().toISOString().split('T')[0],
      partyName,
      status: 'VALIDATED',
      items,
      varianceNotes: varianceNotes ? varianceNotes : undefined,
      createdBy: storageService.getRoleName(currentRole)
    });

    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mouvements de Stock & Opérations Logistiques</h2>
          <p className="text-xs text-slate-500">Bons de Réception Fournisseurs (BR) et Bons de Livraison Clients (BL)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Movement type filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMovementFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                movementFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tous ({movements.length})
            </button>
            <button
              onClick={() => setMovementFilter('ENTREE_BR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                movementFilter === 'ENTREE_BR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Entrées (BR)
            </button>
            <button
              onClick={() => setMovementFilter('SORTIE_BL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                movementFilter === 'SORTIE_BL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Sorties (BL)
            </button>
          </div>

          {/* New BR / BL Buttons (If allowed by RBAC) */}
          {perms.inOutMovements === 'ALL' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCreate('ENTREE_BR')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Nouveau Bon Réception (BR)</span>
              </button>

              <button
                onClick={() => handleOpenCreate('SORTIE_BL')}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Nouveau Bon Livraison (BL)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Type & Référence</th>
                <th className="py-3 px-4">Tiers (Fournisseur / Client)</th>
                <th className="py-3 px-4">Articles & Quantités</th>
                <th className="py-3 px-4">S/N ou N° Lot Associés</th>
                <th className="py-3 px-4">Date & Opérateur</th>
                <th className="py-3 px-4 text-right">Bon PDF</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMovements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Ref & Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl font-bold ${
                        m.type === 'ENTREE_BR' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {m.type === 'ENTREE_BR' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">{m.reference}</span>
                        <span className={`block text-[10px] font-bold ${
                          m.type === 'ENTREE_BR' ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                          {m.type === 'ENTREE_BR' ? 'ENTRÉE BR FOURNISSEUR' : 'SORTIE BL CLIENT'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Party */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {m.partyName}
                  </td>

                  {/* Items summary */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {m.items.map((item, idx) => (
                        <div key={idx} className="text-slate-800">
                          <span className="font-bold">{item.productSku}</span> (x{item.quantity}) - {item.unitPriceHT.toLocaleString('fr-FR')} DH HT
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* S/N or Lots */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {m.items.map((item, idx) => (
                      <div key={idx} className="text-slate-600">
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">
                            S/N: {item.serialNumbers.join(', ')}
                          </span>
                        )}
                        {item.lotNumber && (
                          <span className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 font-bold">
                            Lot: {item.lotNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-semibold text-slate-900">{m.date}</div>
                    <span className="text-[10px] text-slate-400">{m.createdBy}</span>
                  </td>

                  {/* Download PDF */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => generateMovementPdf(m)}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-xs">Aucun mouvement trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MOVEMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg font-bold ${
                  type === 'ENTREE_BR' ? 'bg-emerald-600/30 text-emerald-400' : 'bg-blue-600/30 text-blue-400'
                }`}>
                  {type === 'ENTREE_BR' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Création : {type === 'ENTREE_BR' ? 'Bon de Réception Fournisseur (BR)' : 'Bon de Livraison Client (BL)'}
                  </h3>
                  <p className="text-xs text-slate-400">Scan séquentiel S/N et validation anti-erreur de stock</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Référence du Bon *</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      {type === 'ENTREE_BR' ? 'Fournisseur *' : 'Client / Acheteur *'}
                    </label>
                    {type === 'ENTREE_BR' && (
                      <button
                        type="button"
                        onClick={() => setIsQuickSupplierOpen(true)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Nouveau Fournisseur</span>
                      </button>
                    )}
                  </div>

                  {type === 'ENTREE_BR' ? (
                    <div className="space-y-1.5">
                      <select
                        value={partyName}
                        onChange={e => setPartyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                      >
                        <option value="">-- Choisir un Fournisseur Partenaire --</option>
                        {suppliers.map(sup => (
                          <option key={sup.id} value={sup.name}>
                            {sup.name} {sup.ice ? `(ICE: ${sup.ice.substring(0, 9)}...)` : ''} - {sup.category}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={partyName}
                        onChange={e => setPartyName(e.target.value)}
                        placeholder="Ou saisissez un autre fournisseur manuellement..."
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={partyName}
                      onChange={e => setPartyName(e.target.value)}
                      placeholder="ex: Groupe OCP SA, Ministère de la Santé..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Add Item Row box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ajouter une ligne d'article
                  </span>
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Scan Douchette USB</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Sélectionner Produit</label>
                    <select
                      value={selectedProductId}
                      onChange={e => handleProductSelect(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option value="">-- Choisir un article --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          [{p.sku}] {p.designation} (Stock: {p.currentStockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Prix Unitaire HT (DH)</label>
                    <input
                      type="number"
                      value={itemPriceHT}
                      onChange={e => setItemPriceHT(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Tracking inputs */}
                {selectedProductId && (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    {products.find(p => p.id === selectedProductId)?.trackingType === 'SERIAL_NUMBER' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          S/N Numéros de Série (Séparés par des virgules pour scan séquentiel) *
                        </label>
                        <input
                          type="text"
                          value={itemSNsInput}
                          onChange={e => setItemSNsInput(e.target.value)}
                          placeholder="ex: SN-DELL-982101, SN-DELL-982102"
                          className="w-full bg-white border-2 border-blue-400 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                        />
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {type === 'SORTIE_BL' ? '🔒 Anti-erreur actif : Vérifie que le S/N est disponible en stock' : 'Scan direct avec douchette'}
                        </p>
                      </div>
                    ) : products.find(p => p.id === selectedProductId)?.trackingType === 'BATCH_LOT' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">N° de Lot *</label>
                          <input
                            type="text"
                            value={itemLotInput}
                            onChange={e => setItemLotInput(e.target.value)}
                            placeholder="ex: LOT-2026-T92"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Quantité (unités)</label>
                          <input
                            type="number"
                            value={itemQty}
                            onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Quantité à déplacer</label>
                        <input
                          type="number"
                          value={itemQty}
                          onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddItemLine}
                      className="bg-slate-900 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      + Insérer dans le bon
                    </button>
                  </div>
                )}
              </div>

              {/* Items List inside Modal */}
              {items.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-bold text-slate-700 flex justify-between">
                    <span>Lignes du Bon ({items.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                    {items.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
                        <div>
                          <span className="font-bold text-slate-900">{it.productSku}</span> (x{it.quantity})
                          {it.serialNumbers && <span className="text-[11px] text-blue-600 font-mono ml-2">S/N: {it.serialNumbers.join(', ')}</span>}
                          {it.lotNumber && <span className="text-[11px] text-amber-700 font-mono ml-2">Lot: {it.lotNumber}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-red-600 hover:text-red-800 font-bold text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Remarques / Écarts commande-livraison</label>
                <input
                  type="text"
                  value={varianceNotes}
                  onChange={e => setVarianceNotes(e.target.value)}
                  placeholder="ex: Réception conforme sans réserve, ou cartouche de test incluse"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-medium rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                    type === 'ENTREE_BR' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Valider & Générer Bon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SUPPLIER MODAL */}
      <QuickAddSupplierModal
        isOpen={isQuickSupplierOpen}
        onClose={() => setIsQuickSupplierOpen(false)}
        onSupplierCreated={(newSup) => {
          setPartyName(newSup.name);
          setIsQuickSupplierOpen(false);
        }}
      />
    </div>
  );
};
