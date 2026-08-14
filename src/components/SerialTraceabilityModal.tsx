import React from 'react';
import { SerialItem, Product } from '../types';
import { storageService } from '../services/storageService';
import { X, Shield, ShieldAlert, Calendar, Truck, User, FileText, Barcode, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serial: SerialItem | null;
  onOpenLabelPrinter?: (product: Product, serial: SerialItem) => void;
}

export const SerialTraceabilityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  serial,
  onOpenLabelPrinter
}) => {
  if (!isOpen || !serial) return null;

  const product = storageService.getProductById(serial.productId);

  // Warranty calculation
  const today = new Date();
  const endDate = serial.warrantyEndDate ? new Date(serial.warrantyEndDate) : null;
  const isWarrantyValid = endDate ? endDate > today : false;
  const daysLeft = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Fiche de Traçabilité S/N</h3>
              <p className="text-xs text-slate-400">Historique complet du matériel à numéro de série unique</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Main S/N Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Numéro de Série Unique</span>
              <h2 className="text-xl font-mono font-bold text-white mt-0.5">{serial.serialNumber}</h2>
              <p className="text-xs text-slate-300 mt-1">{product?.designation || 'Équipement IT'}</p>
            </div>
            
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                serial.status === 'IN_STOCK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                serial.status === 'SOLD' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                serial.status === 'RESERVED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {serial.status === 'IN_STOCK' ? 'EN STOCK' :
                 serial.status === 'SOLD' ? 'VENDU / EXPÉDIÉ' :
                 serial.status === 'RESERVED' ? 'RÉSERVÉ (DEVIS)' : serial.status}
              </span>
            </div>
          </div>

          {/* Warranty Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isWarrantyValid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              {isWarrantyValid ? (
                <Shield className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Garantie Constructeur ({serial.warrantyMonths} Mois)
                </h4>
                <p className="text-xs mt-0.5">
                  {isWarrantyValid ? (
                    <>Garantie Active jusqu'au <span className="font-bold">{serial.warrantyEndDate}</span> ({daysLeft} jours restants)</>
                  ) : (
                    <>Garantie Expirée le <span className="font-bold">{serial.warrantyEndDate || 'Inconnue'}</span></>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Life Cycle Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
              Cycle de Vie & Mouvements Logistiques
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              
              {/* Step 1: Reception Inbound */}
              <div className="relative">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Réception en Stock (Bon de Réception)</span>
                    </span>
                    <span className="font-mono text-slate-500">{serial.entryDate}</span>
                  </div>
                  <div className="text-slate-600">
                    Fournisseur : <span className="font-medium text-slate-900">{serial.supplierName}</span>
                  </div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    N° Bon Réception : <span className="text-blue-600 font-semibold">{serial.entryDeliveryNoteRef}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Sale / Dispatch (if sold) */}
              {serial.status === 'SOLD' && (
                <div className="relative">
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Expédition / Vente Client</span>
                      </span>
                      <span className="font-mono text-slate-500">{serial.saleDate || 'Récents'}</span>
                    </div>
                    <div className="text-slate-700">
                      Client Acheteur : <span className="font-bold text-slate-900">{serial.buyerClientName || 'Non spécifié'}</span>
                    </div>
                    <div className="text-slate-600 font-mono text-[11px]">
                      N° Bon de Livraison : <span className="text-blue-600 font-semibold">{serial.exitDeliveryNoteRef || 'BL-2026-X'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Current Stock Location */}
              {serial.status === 'IN_STOCK' && (
                <div className="relative">
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-xs"></div>
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs">
                    <span className="font-bold text-slate-900 block">Emplacement Actuel en Dépôt :</span>
                    <span className="text-amber-900 font-medium mt-0.5 block">
                      {product?.location?.warehouse || 'Dépôt Principal'} — {product?.location?.aisle || 'Allée A'}, {product?.location?.shelf || 'Étagère 1'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>

          {product && onOpenLabelPrinter && (
            <button
              onClick={() => {
                onClose();
                onOpenLabelPrinter(product, serial);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Étiquette Zebra</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
