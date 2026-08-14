import React, { useState, useRef } from 'react';
import { CompanyProfile } from '../types';
import { storageService } from '../services/storageService';
import {
  Building2,
  Image,
  Upload,
  CheckCircle2,
  Save,
  FileText,
  Phone,
  Mail,
  Globe,
  MapPin,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

export const CompanyProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile>(storageService.getCompanyProfile());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Veuillez choisir un fichier image inférieur à 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setProfile(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveCompanyProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Voulez-vous réinitialiser les informations de la société aux valeurs par défaut ?')) {
      const defaultProfile = storageService.getCompanyProfile();
      setProfile(defaultProfile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Personnalisation Identité & Branding</span>
          </div>
          <h2 className="text-lg font-black text-white">
            Informations de la Société & Fournisseur Principal
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Modifiez le nom, logo, coordonnées et identifiants fiscaux (ICE, IF, RC) affichés sur l'application, l'en-tête et les documents PDF générés (BR / BL).
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold px-4 py-2 rounded-xl animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Modifications enregistrées avec succès !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Logo & General Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              1. Identité Visuelle & Logo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Logo Preview Box */}
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center space-y-2">
                {profile.logoUrl && profile.logoUrl.startsWith('data:image') ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo Société"
                    className="max-h-20 object-contain rounded-lg p-1 bg-white border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-xs">
                    {profile.name.substring(0, 2).toUpperCase() || 'IT'}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Téléverser Logo</span>
                  </button>
                  {profile.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-red-600 hover:text-red-700 text-[11px] font-semibold px-2 py-1"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              {/* Name & Tagline */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de la Société / Grossiste Fournisseur *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="ex: DISTRIBUTION & MATÉRIEL IT MAROC SARL"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Slogan / Spécialité / Sous-titre
                  </label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={e => handleChange('tagline', e.target.value)}
                    placeholder="ex: Grossiste, Importateur & Solutions Informatiques Professionnelles"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Contact Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600" />
              2. Coordonnées & Adresse du Siège
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse Postale / Siège Social
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="ex: 145 Boulevard Zerktouni, Immeuble Al Moustakbal, 3ème Étage"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={e => handleChange('city', e.target.value)}
                  placeholder="ex: Casablanca"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code Postal / Pays</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={profile.postalCode}
                    onChange={e => handleChange('postalCode', e.target.value)}
                    placeholder="20000"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={profile.country}
                    onChange={e => handleChange('country', e.target.value)}
                    placeholder="Maroc"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Fixe</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="ex: +212 522 34 56 78"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSM / WhatsApp Support</label>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={e => handleChange('mobile', e.target.value)}
                  placeholder="ex: +212 661 12 34 56"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Officiel</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="ex: contact@distribution-it.ma"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Web</label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={e => handleChange('website', e.target.value)}
                  placeholder="ex: www.distribution-it.ma"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tax & Legal Identifiers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              3. Identifiants Fiscaux & Mentions Légales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">ICE (Identifiant Commun)</label>
                <input
                  type="text"
                  value={profile.ice}
                  onChange={e => handleChange('ice', e.target.value)}
                  placeholder="ex: 001849203000085"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Identifiant Fiscal (IF)</label>
                <input
                  type="text"
                  value={profile.ifNumber}
                  onChange={e => handleChange('ifNumber', e.target.value)}
                  placeholder="ex: 40291039"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registre du Commerce (RC)</label>
                <input
                  type="text"
                  value={profile.rcNumber}
                  onChange={e => handleChange('rcNumber', e.target.value)}
                  placeholder="ex: RC 128490 Casablanca"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de Patente</label>
                <input
                  type="text"
                  value={profile.patente}
                  onChange={e => handleChange('patente', e.target.value)}
                  placeholder="ex: 34918204"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capital Social</label>
                <input
                  type="text"
                  value={profile.capital}
                  onChange={e => handleChange('capital', e.target.value)}
                  placeholder="ex: 1 000 000 DH"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RIB & Coordonnées Bancaires</label>
                <input
                  type="text"
                  value={profile.bankDetails}
                  onChange={e => handleChange('bankDetails', e.target.value)}
                  placeholder="ex: Attijariwafa Bank RIB: 007..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Légale de Bas de Page PDF (Inscrite sur tous les Bons de Réception & Livraison)
                </label>
                <textarea
                  rows={2}
                  value={profile.documentFooterNote}
                  onChange={e => handleChange('documentFooterNote', e.target.value)}
                  placeholder="ex: Marchandise vendue ou livrée conforme aux spécifications..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser la fiche</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer l'Identité Fournisseur</span>
            </button>
          </div>

        </div>

        {/* Right 1 Col: Live PDF Document Preview Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Aperçu en Direct sur PDF</h3>
              </div>
              <span className="text-[10px] bg-blue-900/80 text-blue-300 font-mono px-2 py-0.5 rounded">
                Bon de Réception BR
              </span>
            </div>

            {/* Document Mockup Card */}
            <div className="bg-white text-slate-900 p-4 rounded-xl shadow-inner text-[10px] space-y-3 font-sans border border-slate-200">
              
              {/* Header Box */}
              <div className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 max-w-[140px]">
                  {profile.logoUrl && profile.logoUrl.startsWith('data:image') ? (
                    <img src={profile.logoUrl} alt="Logo" className="w-6 h-6 object-contain rounded bg-white p-0.5" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-blue-600 font-bold flex items-center justify-center text-[9px]">
                      {profile.name.substring(0, 2).toUpperCase() || 'IT'}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-bold truncate text-[10px]">{profile.name}</p>
                    <p className="text-[8px] text-slate-300 truncate">{profile.tagline}</p>
                  </div>
                </div>
                <span className="font-bold text-blue-400 text-[10px]">BR-2026-001</span>
              </div>

              {/* Company Info Subheader */}
              <div className="text-[9px] text-slate-600 space-y-0.5 border-b pb-2 border-slate-100">
                <p className="font-semibold text-slate-800">{profile.address}, {profile.city}</p>
                <p>Tél: {profile.phone} | Email: {profile.email}</p>
                <p className="font-mono text-[8px] text-blue-700 font-bold">ICE: {profile.ice} | IF: {profile.ifNumber} | RC: {profile.rcNumber}</p>
              </div>

              {/* Sample Table */}
              <div className="space-y-1">
                <div className="bg-slate-100 p-1 font-bold text-slate-700 flex justify-between rounded text-[8px]">
                  <span>Article</span>
                  <span>Qté</span>
                  <span>Total HT</span>
                </div>
                <div className="p-1 flex justify-between border-b border-slate-50 text-[8px]">
                  <span className="font-medium text-slate-800">Dell Latitude 5530 i7</span>
                  <span className="font-mono">5</span>
                  <span className="font-mono font-bold">42 000 DH</span>
                </div>
                <div className="p-1 flex justify-between border-b border-slate-50 text-[8px]">
                  <span className="font-medium text-slate-800">Toner HP 59A Noir</span>
                  <span className="font-mono">10</span>
                  <span className="font-mono font-bold">8 500 DH</span>
                </div>
              </div>

              {/* Total & Footer Note */}
              <div className="pt-1 text-right font-bold text-slate-900 border-t border-slate-100">
                <p className="text-[9px]">Total HT : 50 500 DH</p>
                <p className="text-[10px] text-blue-600">Total TTC (20%) : 60 600 DH</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[7px] text-slate-400 italic">
                "{profile.documentFooterNote.substring(0, 80)}..."
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-xl text-slate-300 text-[11px] space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Impact Immédiat sur les Rapports
              </p>
              <p className="text-[10px] leading-relaxed text-slate-400">
                Toutes les modifications enregistrées sont appliquées instantanément aux bordereaux de réception (BR), bons de livraison (BL) et rapports d'inventaire téléchargés en PDF.
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
