import React, { useState } from 'react';
import { Supplier } from '../types';
import { storageService } from '../services/storageService';
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
  Building,
  UserCheck,
  FileText
} from 'lucide-react';

export const SupplierRegistryManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(storageService.getSuppliers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
  const [saveBanner, setSaveBanner] = useState('');

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
      category: 'PC Portables & Serveurs',
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
    if (window.confirm(`Voulez-vous vraiment supprimer le fournisseur "${name}" ?`)) {
      storageService.deleteSupplier(id);
      refreshSuppliers();
      setSaveBanner(`Fournisseur ${name} supprimé avec succès.`);
      setTimeout(() => setSaveBanner(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier?.name) return;

    storageService.saveSupplier(editingSupplier as any);
    refreshSuppliers();
    setIsModalOpen(false);
    setEditingSupplier(null);
    setSaveBanner('Fournisseur enregistré avec succès !');
    setTimeout(() => setSaveBanner(''), 3000);
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.ice.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Annuaire & Partenaires IT</span>
          </div>
          <h2 className="text-lg font-black text-white">
            Gestion des Fournisseurs & Grossistes
          </h2>
          <p className="text-xs text-slate-300">
            Créez, modifiez et organisez la liste de vos fournisseurs informatique partenaires (constructeurs, grossistes, importateurs).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {saveBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Search Bar & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par Nom, Catégorie, Interlocuteur, ICE..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Total : <span className="text-blue-600 font-bold">{filtered.length}</span> / {suppliers.length} Fournisseurs
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map(sup => (
          <div
            key={sup.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b pb-3 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {sup.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                    <span className="inline-block text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100 mt-0.5">
                      {sup.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(sup)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Modifier ce fournisseur"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sup.id, sup.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer ce fournisseur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.contactPerson || 'Non renseigné'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">{sup.phone || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.email || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{sup.paymentTerms}</span>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-500">{sup.address || 'Adresse non spécifiée'}</span>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 font-mono text-[11px] text-blue-900 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>ICE : <strong className="font-bold">{sup.ice || 'Non renseigné'}</strong></span>
                </div>
              </div>

              {sup.notes && (
                <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100 flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{sup.notes}</span>
                </div>
              )}
            </div>

            {/* Bottom Rating */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-medium">Satisfaction Partenaire :</span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < sup.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Aucun fournisseur trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ajustez votre recherche ou ajoutez un nouveau partenaire fournisseur à votre annuaire.
          </p>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && editingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingSupplier.id ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur Partenaire'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nom de la Société Fournisseur *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.name || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, name: e.target.value }))}
                    placeholder="ex: Dell Technologies Maroc"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interlocuteur / Contact</label>
                  <input
                    type="text"
                    value={editingSupplier.contactPerson || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, contactPerson: e.target.value }))}
                    placeholder="ex: M. Youssef Alami"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie de Produits</label>
                  <input
                    type="text"
                    value={editingSupplier.category || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, category: e.target.value }))}
                    placeholder="ex: PC Portables, Serveurs, Imprimantes"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Direct</label>
                  <input
                    type="text"
                    value={editingSupplier.phone || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, phone: e.target.value }))}
                    placeholder="+212 522..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Commercial</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, email: e.target.value }))}
                    placeholder="contact@fournisseur.ma"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Identifiant Commun (ICE)</label>
                  <input
                    type="text"
                    value={editingSupplier.ice || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, ice: e.target.value }))}
                    placeholder="001552399000012"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Conditions de Paiement</label>
                  <select
                    value={editingSupplier.paymentTerms || '30 Jours'}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, paymentTerms: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Comptant à la livraison">Comptant à la livraison</option>
                    <option value="30 Jours">30 Jours</option>
                    <option value="30 Jours Fin de Mois">30 Jours Fin de Mois</option>
                    <option value="60 Jours">60 Jours</option>
                    <option value="90 Jours LCR">90 Jours LCR</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Siège / Dépôt</label>
                  <input
                    type="text"
                    value={editingSupplier.address || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, address: e.target.value }))}
                    placeholder="ex: Casanearshore Shore 1, Sidi Maârouf, Casablanca"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarques ou Numéro de Contrat</label>
                  <textarea
                    rows={2}
                    value={editingSupplier.notes || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev!, notes: e.target.value }))}
                    placeholder="Notes spécifiques, délais de livraison habituels, référence contrat cadre..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingSupplier.id ? 'Mettre à jour' : 'Créer le Fournisseur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
