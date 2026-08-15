import React, { useState } from 'react';
import { Supplier } from '../types';
import { storageService } from '../services/storageService';
import { Truck, X, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated: (supplier: Supplier) => void;
}

export const QuickAddSupplierModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSupplierCreated
}) => {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ice, setIce] = useState('');
  const [category, setCategory] = useState('PC Portables, Serveurs & IT');
  const [paymentTerms, setPaymentTerms] = useState('30 Jours Fin de Mois');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Le nom du fournisseur est obligatoire.');
      return;
    }

    try {
      const created = storageService.saveSupplier({
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ice: ice.trim(),
        category,
        paymentTerms,
        address: address.trim(),
        rating: 5,
        notes: notes.trim()
      });

      onSupplierCreated(created);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création du fournisseur');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Nouveau Fournisseur / Grossiste</h3>
              <p className="text-[11px] text-slate-400">Ajout rapide au registre des partenaires IT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nom de la Société Fournisseur *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ex: Cisco Systems Maroc, Disway, Dell..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interlocuteur / Contact</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="ex: M. Youssef Alami"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+212 522..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Commercial</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commercial@fournisseur.ma"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ICE (Identifiant Commun)</label>
              <input
                type="text"
                value={ice}
                onChange={e => setIce(e.target.value)}
                placeholder="001849203000085"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie Matériel</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PC Portables, Serveurs & IT">PC Portables, Serveurs & IT</option>
                <option value="Imprimantes, Toners & Consommables">Imprimantes, Toners & Consommables</option>
                <option value="Réseaux, Câblage & Onduleurs">Réseaux, Câblage & Onduleurs</option>
                <option value="Consommables, Papier A4 & Boîtes">Consommables, Papier A4 & Boîtes</option>
                <option value="Généraliste / Grossiste IT">Généraliste / Grossiste IT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Conditions de Règlement</label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Comptant à la livraison">Comptant à la livraison</option>
                <option value="30 Jours">30 Jours</option>
                <option value="30 Jours Fin de Mois">30 Jours Fin de Mois</option>
                <option value="60 Jours">60 Jours</option>
                <option value="90 Jours LCR">90 Jours LCR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Siège / Dépôt</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="ex: Zone Industrielle Ain Sebaâ, Casablanca"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Créer & Sélectionner Fournisseur</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
