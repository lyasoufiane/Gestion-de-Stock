import React, { useState } from 'react';
import { Product, ProductCategory, UserRole } from '../types';
import { storageService, getRolePermissions } from '../services/storageService';
import { ProductFormModal } from '../components/ProductFormModal';
import { BarcodeLabelModal } from '../components/BarcodeLabelModal';
import { CsvImportModal } from '../components/CsvImportModal';
import {
  Package,
  Plus,
  Search,
  MapPin,
  Edit2,
  Trash2,
  Printer,
  Barcode,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  Warehouse as WarehouseIcon
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  searchQuery: string;
  onOpenSerialModal?: (product: Product) => void;
}

export const CatalogView: React.FC<Props> = ({
  currentRole,
  searchQuery,
  onOpenSerialModal
}) => {
  const perms = getRolePermissions(currentRole);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [labelProduct, setLabelProduct] = useState<Product | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  const products = storageService.getProducts();
  const warehouses = storageService.getWarehouses();

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'ALL' || p.location?.warehouse === selectedWarehouse;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.designation.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      (p.location?.warehouse && p.location.warehouse.toLowerCase().includes(q));

    return matchesCategory && matchesWarehouse && matchesSearch;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'article "${name}" ?`)) {
      storageService.deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Tabs & Warehouse Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('Matériel Identifiable')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'Matériel Identifiable' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Matériel Identifiable
            </button>
            <button
              onClick={() => setSelectedCategory('Consommables & Fournitures')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'Consommables & Fournitures' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Consommables & Fournitures
            </button>
            <button
              onClick={() => setSelectedCategory('Accessoires & Connectique')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'Accessoires & Connectique' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Accessoires & Connectique
            </button>
          </div>

          {/* Warehouse Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700">
            <WarehouseIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedWarehouse}
              onChange={e => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tous les Dépôts ({warehouses.length})</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.name}>
                  {w.name} ({w.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Product & CSV Import Buttons (If Admin/Purchase/Warehouse) */}
        {perms.systemAdmin || currentRole !== 'SALES' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer border border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importer CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Article</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Article / SKU</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Stock Dispo</th>
                <th className="py-3 px-4">Emplacement Dépôt</th>
                <th className="py-3 px-4">Prix Public HT / TTC</th>
                {perms.priceAndPurchaseAccess === 'FULL' && (
                  <th className="py-3 px-4">PUMP Achat HT</th>
                )}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map(p => {
                const isLowStock = p.currentStockQuantity < p.minStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Article Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.designation}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 leading-snug">{p.designation}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span className="text-blue-600 font-bold">{p.sku}</span>
                            <span>•</span>
                            <span>EAN: {p.barcode}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block ${
                        p.category === 'Matériel Identifiable' ? 'bg-purple-100 text-purple-800' :
                        p.category === 'Consommables & Fournitures' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {p.subcategory}
                      </span>
                    </td>

                    {/* Stock Level Badge */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                          <span className={isLowStock ? 'text-amber-600 font-black' : 'text-slate-900'}>
                            {p.currentStockQuantity}
                          </span>
                          <span className="text-xs text-slate-500 font-normal">{p.unit}</span>
                        </div>
                        {isLowStock ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 font-semibold px-1.5 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Alerte Seuil ({p.minStockThreshold})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Seuil min: {p.minStockThreshold}</span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.location.aisle}, {p.location.shelf}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{p.location.warehouse}</span>
                    </td>

                    {/* Public Prices */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{p.pricing.publicSellingPriceHT.toLocaleString('fr-FR')} DH HT</div>
                      <div className="text-[11px] text-slate-500">{p.pricing.publicSellingPriceTTC.toLocaleString('fr-FR')} DH TTC</div>
                    </td>

                    {/* Purchase Price (Admin/Purchasing Only) */}
                    {perms.priceAndPurchaseAccess === 'FULL' && (
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                        {p.pricing.purchasePriceHT.toLocaleString('fr-FR')} DH
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Print Label Zebra */}
                        <button
                          onClick={() => {
                            setLabelProduct(p);
                            setIsLabelOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Imprimer Étiquette Code-Barres Zebra"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* View S/N Traceability if Serial Number mode */}
                        {p.trackingType === 'SERIAL_NUMBER' && onOpenSerialModal && (
                          <button
                            onClick={() => onOpenSerialModal(p)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Voir Numéros de Série (S/N)"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Product */}
                        {perms.systemAdmin || currentRole !== 'SALES' ? (
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Éditer la fiche produit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        ) : null}

                        {/* Delete Product */}
                        {perms.systemAdmin && (
                          <button
                            onClick={() => handleDelete(p.id, p.designation)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer la fiche produit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-xs">Aucun article trouvé correspondant aux filtres.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={editingProduct}
      />

      <BarcodeLabelModal
        isOpen={isLabelOpen}
        onClose={() => setIsLabelOpen(false)}
        product={labelProduct}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportComplete={() => {
          // Trigger re-render
        }}
      />
    </div>
  );
};
