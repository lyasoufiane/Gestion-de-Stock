import React, { useState, useEffect } from 'react';
import { Warehouse, WarehouseType, Product } from '../types';
import { storageService, subscribeToStorage } from '../services/storageService';
import { authService } from '../services/authService';
import { WarehouseFormModal } from './WarehouseFormModal';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  Box,
  CheckCircle2,
  Edit2,
  Trash2,
  Star,
  Layers,
  AlertCircle,
  TrendingUp,
  Package,
  Eye,
  ShieldCheck,
  Building2,
  RotateCcw
} from 'lucide-react';

export const WarehouseManager: React.FC = () => {
  const currentUser = authService.getUser();
  const isAdmin = currentUser.role === 'ADMIN' || !!currentUser.accessRights?.canManageUsers;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | WarehouseType>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    setWarehouses(storageService.getWarehouses());
    setProducts(storageService.getProducts());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStorage(loadData);
    return () => unsub();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateNew = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setIsModalOpen(true);
  };

  const handleDelete = (wh: Warehouse) => {
    if (wh.isDefault) {
      alert('Impossible de supprimer le dépôt principal défini par défaut. Veuillez d\'abord désigner un autre dépôt par défaut.');
      return;
    }

    const itemsCount = products.filter(p => p.location?.warehouse === wh.name).length;
    if (itemsCount > 0) {
      alert(`Suppression impossible : ${itemsCount} article(s) sont actuellement localisés dans "${wh.name}". Veuillez d'abord modifier l'emplacement de ces articles dans le catalogue.`);
      return;
    }

    if (window.confirm(`Voulez-vous vraiment supprimer le dépôt "${wh.name}" (${wh.code}) ?`)) {
      const res = storageService.deleteWarehouse(wh.id);
      if (res.success) {
        showNotification('success', `Le dépôt "${wh.name}" a été supprimé avec succès.`);
        loadData();
      } else {
        showNotification('error', res.message || 'Erreur lors de la suppression.');
      }
    }
  };

  const handleSetDefault = (wh: Warehouse) => {
    if (!wh.isActive) {
      showNotification('error', 'Impossible de définir un dépôt inactif comme dépôt par défaut.');
      return;
    }
    storageService.setDefaultWarehouse(wh.id);
    showNotification('success', `Le dépôt "${wh.name}" est désormais le dépôt principal par défaut.`);
    loadData();
  };

  // Filtered Warehouses
  const filteredWarehouses = warehouses.filter(w => {
    const matchesType = typeFilter === 'ALL' || w.type === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      w.name.toLowerCase().includes(q) ||
      w.code.toLowerCase().includes(q) ||
      w.city.toLowerCase().includes(q) ||
      (w.managerName && w.managerName.toLowerCase().includes(q)) ||
      (w.address && w.address.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  // Calculate stats
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(w => w.isActive).length;
  const defaultWarehouse = warehouses.find(w => w.isDefault) || warehouses[0];
  const citiesCount = Array.from(new Set(warehouses.map(w => w.city))).length;

  const getTypeBadge = (type: WarehouseType) => {
    switch (type) {
      case 'PRINCIPAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Principal / Siège</span>;
      case 'SECONDAIRE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Secondaire / Réserve</span>;
      case 'MAGASIN_EXPO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Magasin Expo / Showroom</span>;
      case 'TRANSIT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">Quai / Transit</span>;
      case 'SAV':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Atelier SAV & Retours</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">Dépôt</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <WarehouseIcon className="w-4 h-4" />
            <span>Multi-Emplacements & Logistique Stock</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Gestion des Dépôts & Entrepôts Physiques
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Définition des dépôts centraux, magasins d'exposition, réserves palettes et zones SAV. Ces emplacements alimentent directement le catalogue d'articles et les bons d'entrées/sorties (BR/BL).
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Dépôt / Entrepôt</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Dépôts</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalWarehouses}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">{activeWarehouses} actifs en service</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <WarehouseIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dépôt Par Défaut</span>
            <div className="text-sm font-black text-slate-900 mt-0.5 truncate max-w-[150px]">
              {defaultWarehouse?.name || 'Non défini'}
            </div>
            <span className="text-[10px] text-blue-600 font-mono font-bold">
              {defaultWarehouse?.code || 'DEP-DEFAULT'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Villes & Hubs</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{citiesCount}</div>
            <span className="text-[10px] text-slate-500">Régions couvertes</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Articles Assignés</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{products.length}</div>
            <span className="text-[10px] text-purple-600 font-semibold">Répartition multi-sites</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, code, ville, responsable..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({warehouses.length})
          </button>

          <button
            onClick={() => setTypeFilter('PRINCIPAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'PRINCIPAL'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Principaux
          </button>

          <button
            onClick={() => setTypeFilter('SECONDAIRE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'SECONDAIRE'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Secondaires
          </button>

          <button
            onClick={() => setTypeFilter('MAGASIN_EXPO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'MAGASIN_EXPO'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Showrooms
          </button>

          <button
            onClick={() => setTypeFilter('SAV')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'SAV'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            SAV & Retours
          </button>
        </div>
      </div>

      {/* Warehouses Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWarehouses.map(wh => {
          // Calculate stock in this warehouse
          const whProducts = products.filter(p => p.location?.warehouse === wh.name);
          const totalUnits = whProducts.reduce((sum, p) => sum + p.currentStockQuantity, 0);
          const totalValueHT = whProducts.reduce((sum, p) => sum + (p.currentStockQuantity * p.pricing.purchasePriceHT), 0);

          return (
            <div
              key={wh.id}
              className={`bg-white rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between space-y-4 hover:shadow-md ${
                wh.isDefault
                  ? 'border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {/* Header card */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(wh.type)}
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {wh.code}
                      </span>
                      {wh.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                          <Star className="w-3 h-3 fill-white" />
                          <span>DÉPÔT PAR DÉFAUT</span>
                        </span>
                      )}
                      {!wh.isActive && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                          Inactif
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {wh.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(wh)}
                      title="Modifier les détails du dépôt"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(wh)}
                      title="Supprimer ce dépôt"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location details */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800">{wh.city}</span>
                    {wh.address && <span className="text-slate-500 truncate">• {wh.address}</span>}
                  </div>

                  {wh.managerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700">Resp: <strong className="text-slate-900">{wh.managerName}</strong></span>
                      {wh.phone && <span className="text-slate-500 font-mono text-[11px]">• {wh.phone}</span>}
                    </div>
                  )}

                  {wh.capacityNotes && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Box className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{wh.capacityNotes}</span>
                    </div>
                  )}
                </div>

                {wh.description && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-2 px-1">
                    "{wh.description}"
                  </p>
                )}
              </div>

              {/* Real-time Stock Metrics inside this warehouse */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Articles Assignés</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {whProducts.length} réf. <span className="text-slate-500 font-normal">({totalUnits} unités)</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Valeur Stock HT</span>
                    <span className="font-bold text-blue-700 font-mono text-xs">
                      {totalValueHT.toLocaleString('fr-FR')} DH
                    </span>
                  </div>
                </div>

                {!wh.isDefault && wh.isActive && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(wh)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/80 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Star className="w-3 h-3" />
                    <span>Définir par défaut</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <WarehouseIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Aucun dépôt ne correspond à votre recherche</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifiez vos filtres ou créez un nouveau dépôt pour étendre vos emplacements logistiques.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Dépôt</span>
          </button>
        </div>
      )}

      {/* Modal create / edit */}
      <WarehouseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        warehouseToEdit={editingWarehouse}
        onSaved={() => {
          loadData();
          showNotification('success', editingWarehouse ? 'Dépôt mis à jour avec succès.' : 'Nouveau dépôt créé avec succès.');
        }}
      />
    </div>
  );
};
