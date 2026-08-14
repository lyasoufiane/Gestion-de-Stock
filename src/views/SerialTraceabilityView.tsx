import React, { useState } from 'react';
import { SerialItem, SerialStatus, Product } from '../types';
import { storageService } from '../services/storageService';
import { SerialTraceabilityModal } from '../components/SerialTraceabilityModal';
import { BarcodeLabelModal } from '../components/BarcodeLabelModal';
import {
  Barcode,
  Search,
  ShieldCheck,
  ShieldAlert,
  Truck,
  User,
  ExternalLink,
  Printer,
  Calendar
} from 'lucide-react';

interface Props {
  searchQuery: string;
}

export const SerialTraceabilityView: React.FC<Props> = ({ searchQuery }) => {
  const [selectedStatus, setSelectedStatus] = useState<SerialStatus | 'ALL'>('ALL');
  const [activeSerial, setActiveSerial] = useState<SerialItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [labelProduct, setLabelProduct] = useState<Product | null>(null);
  const [labelSerial, setLabelSerial] = useState<SerialItem | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  const serials = storageService.getSerials();
  const products = storageService.getProducts();

  const filteredSerials = serials.filter(s => {
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    const prod = products.find(p => p.id === s.productId);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.serialNumber.toLowerCase().includes(q) ||
      s.supplierName.toLowerCase().includes(q) ||
      s.entryDeliveryNoteRef.toLowerCase().includes(q) ||
      (s.buyerClientName && s.buyerClientName.toLowerCase().includes(q)) ||
      (prod && prod.designation.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const handleOpenTraceability = (serial: SerialItem) => {
    setActiveSerial(serial);
    setIsModalOpen(true);
  };

  const handleOpenLabelPrinter = (prod: Product, serial: SerialItem) => {
    setLabelProduct(prod);
    setLabelSerial(serial);
    setIsLabelOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Barcode className="w-4 h-4" />
            <span>Suivi Individuel Haute-Valeur</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Traçabilité par Numéro de Série (S/N)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recherche globale des PC portables, serveurs, écrans et imprimantes avec suivi des garanties constructeurs (12/24/36 mois).
          </p>
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          {(['ALL', 'IN_STOCK', 'SOLD', 'RESERVED', 'SAV'] as Array<SerialStatus | 'ALL'>).map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedStatus === st ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tous S/N' : st === 'IN_STOCK' ? 'En Stock' : st === 'SOLD' ? 'Vendus' : st === 'RESERVED' ? 'Réservés' : st}
            </button>
          ))}
        </div>
      </div>

      {/* S/N Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Numéro de Série (S/N)</th>
                <th className="py-3 px-4">Équipement IT Associé</th>
                <th className="py-3 px-4">Statut Stock</th>
                <th className="py-3 px-4">Entrée Fournisseur (BR)</th>
                <th className="py-3 px-4">Sortie / Client (BL)</th>
                <th className="py-3 px-4">Garantie Constructeur</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSerials.map(s => {
                const prod = products.find(p => p.id === s.productId);
                const isWarrantyActive = s.warrantyEndDate ? new Date(s.warrantyEndDate) > new Date() : false;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* S/N Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">{s.serialNumber}</span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{prod?.designation || 'Article Inconnu'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">SKU: {prod?.sku}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block ${
                        s.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                        s.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {s.status === 'IN_STOCK' ? 'EN STOCK' :
                         s.status === 'SOLD' ? 'VENDU' :
                         s.status === 'RESERVED' ? 'RÉSERVÉ' : s.status}
                      </span>
                    </td>

                    {/* Inbound BR */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{s.supplierName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.entryDeliveryNoteRef} ({s.entryDate})</div>
                    </td>

                    {/* Outbound BL */}
                    <td className="py-3.5 px-4">
                      {s.buyerClientName ? (
                        <div>
                          <div className="text-slate-800 font-medium">{s.buyerClientName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{s.exitDeliveryNoteRef || 'BL'} ({s.saleDate})</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">-</span>
                      )}
                    </td>

                    {/* Warranty */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {isWarrantyActive ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900">{s.warrantyMonths} Mois</span>
                          <span className="text-[11px] text-slate-500 block">Jusqu'au {s.warrantyEndDate || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Print Label Zebra */}
                        {prod && (
                          <button
                            onClick={() => handleOpenLabelPrinter(prod, s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Imprimer Étiquette Zebra S/N"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}

                        {/* Open Fiche de Traçabilité */}
                        <button
                          onClick={() => handleOpenTraceability(s)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Fiche S/N</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSerials.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Barcode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-xs">Aucun numéro de série trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traceability Modal */}
      <SerialTraceabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serial={activeSerial}
        onOpenLabelPrinter={handleOpenLabelPrinter}
      />

      <BarcodeLabelModal
        isOpen={isLabelOpen}
        onClose={() => setIsLabelOpen(false)}
        product={labelProduct}
        serial={labelSerial}
      />
    </div>
  );
};
