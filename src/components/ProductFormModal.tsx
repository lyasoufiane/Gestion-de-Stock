import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, TrackingType, Supplier, Warehouse } from '../types';
import { storageService } from '../services/storageService';
import { QuickAddSupplierModal } from './QuickAddSupplierModal';
import { WarehouseFormModal } from './WarehouseFormModal';
import { X, Save, Package, DollarSign, MapPin, AlertCircle, Shield, Truck, Plus, Warehouse as WarehouseIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaved?: () => void;
}

export const ProductFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaved
}) => {
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [isQuickWarehouseOpen, setIsQuickWarehouseOpen] = useState(false);
  const suppliers = storageService.getSuppliers();
  const warehouses = storageService.getWarehouses().filter(w => w.isActive);
  const defaultWh = storageService.getDefaultWarehouse();

  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    designation: '',
    brand: '',
    model: '',
    category: 'Matériel Identifiable',
    subcategory: 'PC Portables',
    barcode: '',
    supplierId: '',
    supplierName: '',
    location: { warehouse: defaultWh?.name || 'Dépôt Principal - Casablanca', aisle: 'Allée A', shelf: 'Étagère 1' },
    pricing: { purchasePriceHT: 0, publicSellingPriceHT: 0, publicSellingPriceTTC: 0, resellerPriceHT: 0 },
    minStockThreshold: 5,
    currentStockQuantity: 0,
    trackingType: 'SERIAL_NUMBER',
    warrantyMonths: 24,
    unit: 'Unité',
    imageUrl: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      const currentDefaultWh = storageService.getDefaultWarehouse();
      setFormData({
        sku: `SKU-IT-${Math.floor(1000 + Math.random() * 9000)}`,
        designation: '',
        brand: '',
        model: '',
        category: 'Matériel Identifiable',
        subcategory: 'PC Portables',
        barcode: `611${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        location: { warehouse: currentDefaultWh?.name || 'Dépôt Principal - Casablanca', aisle: 'Allée A', shelf: 'Étagère 1' },
        pricing: { purchasePriceHT: 1000, publicSellingPriceHT: 1250, publicSellingPriceTTC: 1500, resellerPriceHT: 1150 },
        minStockThreshold: 5,
        currentStockQuantity: 0,
        trackingType: 'SERIAL_NUMBER',
        warrantyMonths: 24,
        unit: 'Unité',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80'
      });
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: ProductCategory) => {
    let sub = 'PC Portables';
    let track: TrackingType = 'SERIAL_NUMBER';
    let unit = 'Unité';
    let warranty = 24;

    if (cat === 'Consommables & Fournitures') {
      sub = 'Toners Laser';
      track = 'BATCH_LOT';
      unit = 'Cartouche';
      warranty = 0;
    } else if (cat === 'Accessoires & Connectique') {
      sub = 'Câblage';
      track = 'QUANTITY_SKU';
      unit = 'Unité';
      warranty = 12;
    }

    setFormData(prev => ({
      ...prev,
      category: cat,
      subcategory: sub,
      trackingType: track,
      unit,
      warrantyMonths: warranty
    }));
  };

  const handlePriceHTChange = (val: number) => {
    const ttc = Math.round(val * 1.2 * 100) / 100;
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing!,
        publicSellingPriceHT: val,
        publicSellingPriceTTC: ttc
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.designation?.trim()) {
      setErrorMsg('Veuillez saisir la désignation de l\'article.');
      return;
    }
    if (!formData.sku?.trim()) {
      setErrorMsg('Veuillez renseigner la référence unique (SKU).');
      return;
    }

    storageService.saveProduct(formData as any);
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {productToEdit ? 'Édition Fiche Article' : 'Nouveau Produit IT'}
              </h3>
              <p className="text-xs text-slate-400">Catalogue & Spécifications Fiche Article</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              1. Catégorie d'Article (Typologie du Cahier des Charges)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['Matériel Identifiable', 'Consommables & Fournitures', 'Accessoires & Connectique'] as ProductCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`p-3 text-left rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    formData.category === cat
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold">{cat}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {cat === 'Matériel Identifiable' ? 'S/N + Garantie' :
                     cat === 'Consommables & Fournitures' ? 'Lots + Seuil Alerte' : 'Quantitatif SKU'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Identification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Désignation Complète *</label>
              <input
                type="text"
                value={formData.designation || ''}
                onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))}
                placeholder="ex: PC Portable Dell Latitude 5530 i7 16GB"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Référence Unique (SKU) *</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                placeholder="ex: LAP-DELL-5530"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Marque Constructeur</label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
                placeholder="ex: Dell, HP, Epson, Cisco"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Modèle</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                placeholder="ex: Latitude 5530"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sous-Catégorie</label>
              <input
                type="text"
                value={formData.subcategory || ''}
                onChange={e => setFormData(p => ({ ...p, subcategory: e.target.value }))}
                placeholder="ex: PC Portables, Toners Laser, Câblage"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Code-Barres (EAN-13 / Code 128)</label>
              <input
                type="text"
                value={formData.barcode || ''}
                onChange={e => setFormData(p => ({ ...p, barcode: e.target.value }))}
                placeholder="ex: 6111234500018"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Supplier Selection */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Fournisseur Principal / Grossiste Attribué
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickSupplierOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nouveau Fournisseur</span>
                </button>
              </div>
              <select
                value={formData.supplierName || ''}
                onChange={e => {
                  const sName = e.target.value;
                  const found = suppliers.find(s => s.name === sName);
                  setFormData(p => ({
                    ...p,
                    supplierName: sName,
                    supplierId: found?.id || ''
                  }));
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Aucun fournisseur spécifié / Non assigné --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.category}) {s.ice ? `• ICE: ${s.ice}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location in Warehouse */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Emplacement Dépôt (Multi-Emplacements)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickWarehouseOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Dépôt</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Dépôt / Entrepôt *</label>
                <select
                  value={formData.location?.warehouse || (warehouses[0]?.name || 'Dépôt Principal - Casablanca')}
                  onChange={e => setFormData(p => ({ ...p, location: { ...p.location!, warehouse: e.target.value } }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name} ({wh.code} - {wh.city}){wh.isDefault ? ' ⭐ [Par Défaut]' : ''}
                    </option>
                  ))}
                  {/* In case current product has an old warehouse not in list */}
                  {formData.location?.warehouse && !warehouses.some(w => w.name === formData.location?.warehouse) && (
                    <option value={formData.location.warehouse}>
                      {formData.location.warehouse} (Ancien / Spécifique)
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Zone / Allée</label>
                <input
                  type="text"
                  value={formData.location?.aisle || ''}
                  onChange={e => setFormData(p => ({ ...p, location: { ...p.location!, aisle: e.target.value } }))}
                  placeholder="ex: Allée A"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Étagère / Rack</label>
                <input
                  type="text"
                  value={formData.location?.shelf || ''}
                  onChange={e => setFormData(p => ({ ...p, location: { ...p.location!, shelf: e.target.value } }))}
                  placeholder="ex: Étagère 3"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Pricing Multi-Tarifs */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Grille Tarifaire (Multi-Tarifs)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Prix Achat HT (PUMP)</label>
                <input
                  type="number"
                  value={formData.pricing?.purchasePriceHT || 0}
                  onChange={e => setFormData(p => ({ ...p, pricing: { ...p.pricing!, purchasePriceHT: parseFloat(e.target.value) || 0 } }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Prix Vente Public HT</label>
                <input
                  type="number"
                  value={formData.pricing?.publicSellingPriceHT || 0}
                  onChange={e => handlePriceHTChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Prix Public TTC (20%)</label>
                <input
                  type="number"
                  value={formData.pricing?.publicSellingPriceTTC || 0}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Prix Revendeur HT</label>
                <input
                  type="number"
                  value={formData.pricing?.resellerPriceHT || 0}
                  onChange={e => setFormData(p => ({ ...p, pricing: { ...p.pricing!, resellerPriceHT: parseFloat(e.target.value) || 0 } }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Tracking & Reorder Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mode de Gestion</label>
              <select
                value={formData.trackingType}
                onChange={e => setFormData(p => ({ ...p, trackingType: e.target.value as TrackingType }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="SERIAL_NUMBER">S/N Unique (Matériel High-Tech)</option>
                <option value="BATCH_LOT">Gestion par Lots (Consommables)</option>
                <option value="QUANTITY_SKU">Quantité Standard (Accessoires)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Seuil Alerte Réappro (Min)</label>
              <input
                type="number"
                value={formData.minStockThreshold || 0}
                onChange={e => setFormData(p => ({ ...p, minStockThreshold: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Garantie Constructeur</label>
              <select
                value={formData.warrantyMonths || 0}
                onChange={e => setFormData(p => ({ ...p, warrantyMonths: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value={0}>Aucune</option>
                <option value={12}>12 Mois</option>
                <option value={24}>24 Mois</option>
                <option value={36}>36 Mois</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer l'Article</span>
            </button>
          </div>
        </form>
      </div>

      {/* QUICK ADD SUPPLIER MODAL */}
      <QuickAddSupplierModal
        isOpen={isQuickSupplierOpen}
        onClose={() => setIsQuickSupplierOpen(false)}
        onSupplierCreated={(newSup) => {
          setFormData(p => ({
            ...p,
            supplierId: newSup.id,
            supplierName: newSup.name
          }));
          setIsQuickSupplierOpen(false);
        }}
      />

      {/* QUICK ADD WAREHOUSE MODAL */}
      <WarehouseFormModal
        isOpen={isQuickWarehouseOpen}
        onClose={() => setIsQuickWarehouseOpen(false)}
        onSaved={(newWh) => {
          setFormData(p => ({
            ...p,
            location: {
              warehouse: newWh.name,
              aisle: p.location?.aisle || 'Allée A',
              shelf: p.location?.shelf || 'Étagère 1'
            }
          }));
          setIsQuickWarehouseOpen(false);
        }}
      />
    </div>
  );
};
