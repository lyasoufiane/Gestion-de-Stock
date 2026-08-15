import React, { useState, useEffect } from 'react';
import { Warehouse, WarehouseType } from '../types';
import { storageService } from '../services/storageService';
import {
  X,
  Warehouse as WarehouseIcon,
  Save,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  Box,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouseToEdit?: Warehouse | null;
  onSaved?: (savedWarehouse: Warehouse) => void;
}

const WAREHOUSE_TYPES: { type: WarehouseType; label: string; desc: string; color: string }[] = [
  {
    type: 'PRINCIPAL',
    label: 'Dépôt Principal / Siège',
    desc: 'Centre de distribution central, réceptions et expéditions majeures',
    color: 'border-blue-500 bg-blue-50/50 text-blue-700'
  },
  {
    type: 'SECONDAIRE',
    label: 'Dépôt Secondaire / Réserve',
    desc: 'Stock de masse, palettes, matériel volumineux et consommables',
    color: 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
  },
  {
    type: 'MAGASIN_EXPO',
    label: 'Magasin Expo / Showroom',
    desc: 'Showroom de démonstration et vente directe aux professionnels',
    color: 'border-amber-500 bg-amber-50/50 text-amber-700'
  },
  {
    type: 'TRANSIT',
    label: 'Zone Transit / Quai',
    desc: 'Zone de cross-docking, réceptions en cours de contrôle ou départ rapide',
    color: 'border-cyan-500 bg-cyan-50/50 text-cyan-700'
  },
  {
    type: 'SAV',
    label: 'Atelier SAV & Retours',
    desc: 'Zone dédiée aux diagnostics, réparations, retours clients et constructeurs',
    color: 'border-rose-500 bg-rose-50/50 text-rose-700'
  }
];

export const WarehouseFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  warehouseToEdit,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<WarehouseType>('PRINCIPAL');
  const [city, setCity] = useState('Casablanca');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [capacityNotes, setCapacityNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (warehouseToEdit) {
      setName(warehouseToEdit.name || '');
      setCode(warehouseToEdit.code || '');
      setType(warehouseToEdit.type || 'SECONDAIRE');
      setCity(warehouseToEdit.city || 'Casablanca');
      setAddress(warehouseToEdit.address || '');
      setManagerName(warehouseToEdit.managerName || '');
      setPhone(warehouseToEdit.phone || '');
      setEmail(warehouseToEdit.email || '');
      setCapacityNotes(warehouseToEdit.capacityNotes || '');
      setIsDefault(!!warehouseToEdit.isDefault);
      setIsActive(warehouseToEdit.isActive !== undefined ? warehouseToEdit.isActive : true);
      setDescription(warehouseToEdit.description || '');
    } else {
      const randomCodeNum = Math.floor(10 + Math.random() * 90);
      setName('');
      setCode(`DEP-CASA-${randomCodeNum}`);
      setType('SECONDAIRE');
      setCity('Casablanca');
      setAddress('');
      setManagerName('');
      setPhone('');
      setEmail('');
      setCapacityNotes('500 m² • 100 Palettes');
      setIsDefault(false);
      setIsActive(true);
      setDescription('');
    }
    setErrorMessage('');
  }, [warehouseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Veuillez renseigner le nom du dépôt ou de l\'entrepôt.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Veuillez renseigner un code unique pour le dépôt.');
      return;
    }

    try {
      const saved = storageService.saveWarehouse({
        id: warehouseToEdit?.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        city: city.trim(),
        address: address.trim(),
        managerName: managerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        capacityNotes: capacityNotes.trim(),
        isDefault,
        isActive,
        description: description.trim()
      });

      if (onSaved) onSaved(saved);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de l\'enregistrement du dépôt.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-2xl border border-blue-500/30">
              <WarehouseIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {warehouseToEdit ? 'Modifier le Dépôt / Entrepôt' : 'Nouveau Dépôt / Entrepôt'}
              </h3>
              <p className="text-xs text-slate-400">
                Configuration des emplacements de stockage physique & logistique
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Type d'Emplacement / Fonction Logistique *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WAREHOUSE_TYPES.map(t => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    type === t.type
                      ? `${t.color} border-2 shadow-xs font-bold`
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.label}</span>
                    {type === t.type && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-normal leading-tight">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom Complet du Dépôt / Entrepôt *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!warehouseToEdit && e.target.value) {
                      const cleanCity = city || 'CASA';
                      const prefix = e.target.value.substring(0, 4).replace(/[^a-zA-Z]/g, '').toUpperCase() || 'DEP';
                      setCode(`${prefix}-${cleanCity.substring(0, 4).toUpperCase()}`);
                    }
                  }}
                  placeholder="ex: Dépôt Principal - Casablanca, Magasin Expo - Rabat, Dépôt Logistique Berrechid"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Code Interne / Identifiant *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="ex: DEP-CASA-01, MAG-RAB-02"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ville / Région *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="ex: Casablanca, Rabat, Tanger, Marrakech"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse Géographique Complète / Zone Industrielle
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="ex: Zone Industrielle Ain Sebaâ, Allée des Usines n°14"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Manager & Contact */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Responsable du Dépôt / Magasinier en Chef
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  placeholder="ex: Tariq Mansouri"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Téléphone Direct / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="ex: +212 522 34 56 78"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Opérationnel du Dépôt
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ex: depot.casa@distribution-it.ma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Capacité & Superficie / Racks
              </label>
              <div className="relative">
                <Box className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={capacityNotes}
                  onChange={e => setCapacityNotes(e.target.value)}
                  placeholder="ex: 1 200 m² • 350 Palettes • 12 Racks"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes & Consignes Particulières de Stockage
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="ex: Accès semi-remorques quai n°2, zone climatisée pour serveurs et cartouches, horaires 8h-18h..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Options: Default & Active */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Définir comme Dépôt Principal par Défaut
                </span>
                <p className="text-[11px] text-slate-500">
                  Ce dépôt sera présélectionné automatiquement lors de la création d'articles et des réceptions fournisseurs (BR).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none pt-1 border-t border-slate-200/80">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Dépôt Actif en exploitation
                </span>
                <p className="text-[11px] text-slate-500">
                  Si décoché, le dépôt sera marqué comme inactif et masqué des nouveaux mouvements.
                </p>
              </div>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{warehouseToEdit ? 'Mettre à jour le Dépôt' : 'Enregistrer le Dépôt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
