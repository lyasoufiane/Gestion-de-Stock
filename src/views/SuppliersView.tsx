import React, { useState } from 'react';
import { Supplier, UserRole } from '../types';
import { storageService, getRolePermissions } from '../services/storageService';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Package,
  ExternalLink,
  ArrowDownLeft,
  FileText
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onNavigateToMovements?: (supplierName?: string) => void;
}

export const SuppliersView: React.FC<Props> = ({ currentRole, onNavigateToMovements }) => {
  const perms = getRolePermissions(currentRole);
  const [suppliers, setSuppliers] = useState<Supplier[]>(storageService.getSuppliers());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const products = storageService.getProducts();

  const refreshSuppliers = () => {
    setSuppliers(storageService.getSuppliers());
  };

  const handleOpenAdd = () => {
    setEditingSupplier({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      ice: '',
      category: 'PC Portables, Serveurs & IT',
      paymentTerms: '30 Jours Fin de Mois',
      rating: 5,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier({ ...sup });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Confirmez-vous la suppression du fournisseur "${name}" ?`)) {
      storageService.deleteSupplier(id);
      refreshSuppliers();
      setFeedbackMsg(`Fournisseur "${name}" supprimé.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier?.name?.trim()) return;

    storageService.saveSupplier({
      id: editingSupplier.id,
      name: editingSupplier.name.trim(),
      contactPerson: editingSupplier.contactPerson?.trim() || '',
      phone: editingSupplier.phone?.trim() || '',
      email: editingSupplier.email?.trim() || '',
      address: editingSupplier.address?.trim() || '',
      ice: editingSupplier.ice?.trim() || '',
      category: editingSupplier.category || 'Généraliste IT',
      paymentTerms: editingSupplier.paymentTerms || '30 Jours Fin de Mois',
      rating: editingSupplier.rating || 5,
      notes: editingSupplier.notes?.trim() || ''
    });

    refreshSuppliers();
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFeedbackMsg('Fournisseur enregistré avec succès !');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Get distinct categories
  const categories = Array.from(new Set(suppliers.map(s => s.category).filter(Boolean)));

  const filtered = suppliers.filter(s => {
    const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.ice.includes(q) ||
      (s.address && s.address.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Référentiel Fournisseurs & Grossistes Partenaires</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Annuaire & Gestion des Fournisseurs IT
          </h2>
          <p className="text-xs text-slate-300">
            Ajoutez, consultez et gérez tous vos fournisseurs partenaires, constructeurs, importateurs et distributeurs avec ICE et coordonnées.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Fournisseur</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total Fournisseurs</div>
            <div className="text-xl font-black text-slate-900 font-mono">{suppliers.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Fournisseurs avec ICE</div>
            <div className="text-xl font-black text-indigo-600 font-mono">
              {suppliers.filter(s => s.ice && s.ice.length >= 8).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Partenaires Certifiés (5★)</div>
            <div className="text-xl font-black text-emerald-600 font-mono">
              {suppliers.filter(s => s.rating >= 5).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Catégories Matériel</div>
            <div className="text-xl font-black text-amber-600 font-mono">{categories.length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher fournisseur par Nom, Catégorie, Interlocuteur, ICE..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Affichage : <span className="text-blue-600 font-bold">{filtered.length}</span> fournisseur(s)
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({suppliers.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} ({suppliers.filter(s => s.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(sup => {
          // Find products related to this supplier
          const relatedProducts = products.filter(
            p => (p.supplierName && p.supplierName.toLowerCase() === sup.name.toLowerCase()) ||
                 (p.supplierId === sup.id)
          );

          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {sup.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{sup.name}</h3>
                      <span className="inline-block text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100 mt-1">
                        {sup.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      title="Modifier"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sup.id, sup.name)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details & Contacts */}
                <div className="space-y-2 text-xs text-slate-600">
                  {sup.contactPerson && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 w-24 shrink-0">Contact :</span>
                      <span className="font-medium text-slate-900">{sup.contactPerson}</span>
                    </div>
                  )}

                  {sup.phone && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 w-24 shrink-0">Téléphone :</span>
                      <a
                        href={`tel:${sup.phone}`}
                        className="text-blue-600 hover:underline font-mono font-medium flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{sup.phone}</span>
                      </a>
                    </div>
                  )}

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 w-24 shrink-0">Email :</span>
                      <a
                        href={`mailto:${sup.email}`}
                        className="text-blue-600 hover:underline font-medium truncate flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{sup.email}</span>
                      </a>
                    </div>
                  )}

                  {sup.ice && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 w-24 shrink-0">ICE :</span>
                      <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                        {sup.ice}
                      </span>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-slate-600 text-[11px] leading-tight">{sup.address}</span>
                    </div>
                  )}
                </div>

                {/* Rating & Payment Terms */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Règlement</span>
                    <span className="font-bold text-slate-800">{sup.paymentTerms}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Satisfaction</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: sup.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {sup.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    "{sup.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {relatedProducts.length > 0
                    ? `${relatedProducts.length} article(s) lié(s)`
                    : 'Aucun article lié'}
                </span>

                {onNavigateToMovements && (
                  <button
                    onClick={() => onNavigateToMovements(sup.name)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Réception BR</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">Aucun fournisseur trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau fournisseur.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Fournisseur</span>
            </button>
          </div>
        )}
      </div>

      {/* FULL ADD / EDIT MODAL */}
      {isModalOpen && editingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingSupplier.id ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur Partenaire'}
                  </h3>
                  <p className="text-xs text-slate-400">Renseignez les détails fiscaux et commerciaux du fournisseur</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nom de la Société Fournisseur *
                </label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name || ''}
                  onChange={e => setEditingSupplier(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Dell Technologies Maroc, HP Inc, Disway SA..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interlocuteur / Contact</label>
                  <input
                    type="text"
                    value={editingSupplier.contactPerson || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="ex: Responsable Commercial"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Direct</label>
                  <input
                    type="text"
                    value={editingSupplier.phone || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+212 522 000000"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Commercial</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@fournisseur.ma"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ICE (15 chiffres)</label>
                  <input
                    type="text"
                    value={editingSupplier.ice || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, ice: e.target.value }))}
                    placeholder="001849203000085"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie Matériel</label>
                  <select
                    value={editingSupplier.category || 'PC Portables, Serveurs & IT'}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PC Portables, Serveurs & IT">PC Portables, Serveurs & IT</option>
                    <option value="Imprimantes, Toners & Consommables">Imprimantes, Toners & Consommables</option>
                    <option value="Réseaux, Câblage & Onduleurs">Réseaux, Câblage & Onduleurs</option>
                    <option value="Papeterie & Boîtes">Papeterie & Boîtes</option>
                    <option value="Grossiste & Importateur Général">Grossiste & Importateur Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Modalités de Règlement</label>
                  <select
                    value={editingSupplier.paymentTerms || '30 Jours Fin de Mois'}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Comptant à la livraison">Comptant à la livraison</option>
                    <option value="30 Jours">30 Jours</option>
                    <option value="30 Jours Fin de Mois">30 Jours Fin de Mois</option>
                    <option value="60 Jours Fin de Mois">60 Jours Fin de Mois</option>
                    <option value="90 Jours LCR">90 Jours LCR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Siège / Dépôt</label>
                <input
                  type="text"
                  value={editingSupplier.address || ''}
                  onChange={e => setEditingSupplier(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="ex: Bd Mohammed V, Quartier Industriel Sidi Bernoussi, Casablanca"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note de Satisfaction (1 à 5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingSupplier(prev => ({ ...prev, rating: star }))}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (editingSupplier.rating || 5) >= star
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">
                    {editingSupplier.rating || 5} / 5 étoiles
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarques / Conditions Particulières</label>
                <textarea
                  rows={2}
                  value={editingSupplier.notes || ''}
                  onChange={e => setEditingSupplier(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ex: Franco de port dès 5.000 DH HT, remise annuelle 3%..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer Fournisseur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
