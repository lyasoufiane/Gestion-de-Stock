import React, { useEffect, useRef, useState } from 'react';
import { Product, SerialItem } from '../types';
import { renderBarcodeSvg, generateQrCodeDataUrl } from '../utils/barcodeGenerator';
import { X, Printer, QrCode, Barcode, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  serial?: SerialItem | null;
}

export const BarcodeLabelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  product,
  serial
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [labelFormat, setLabelFormat] = useState<'STANDARD' | 'ZEBRA_70x36' | 'MINI_STICKER'>('ZEBRA_70x36');

  const barcodeText = serial?.serialNumber || product?.barcode || product?.sku || '123456789';

  useEffect(() => {
    if (isOpen && barcodeText) {
      if (svgRef.current) {
        renderBarcodeSvg(svgRef.current, barcodeText, 'CODE128');
      }
      generateQrCodeDataUrl(barcodeText).then(url => setQrUrl(url));
    }
  }, [isOpen, barcodeText, labelFormat]);

  if (!isOpen || (!product && !serial)) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(barcodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:w-auto">
        
        {/* Header - Hidden in Print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Générateur d'Étiquette Code-Barres</h3>
              <p className="text-xs text-slate-400">Impression automatique thermique Zebra ZD421 / Laser</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Format selector - Hidden in print */}
          <div className="print:hidden space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Format d'Étiquette / Imprimante :</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLabelFormat('ZEBRA_70x36')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border cursor-pointer transition-colors ${
                  labelFormat === 'ZEBRA_70x36' ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Zebra (70x36mm)
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat('STANDARD')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border cursor-pointer transition-colors ${
                  labelFormat === 'STANDARD' ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Standard (100x50mm)
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat('MINI_STICKER')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border cursor-pointer transition-colors ${
                  labelFormat === 'MINI_STICKER' ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Mini S/N (50x25mm)
              </button>
            </div>
          </div>

          {/* PRINTABLE LABEL CARD */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex justify-center items-center">
            <div className="bg-white border-2 border-slate-900 rounded-lg p-4 shadow-md w-full max-w-sm text-center space-y-2 font-sans text-slate-900 print:shadow-none print:border-black">
              
              {/* Company & Location Tag */}
              <div className="flex justify-between items-center text-[10px] font-bold border-b pb-1 border-slate-200 uppercase tracking-tight text-slate-600">
                <span>STOCK IT MAROC</span>
                <span>{product?.location?.aisle || 'DEPOT PRINCIPAL'}</span>
              </div>

              {/* Product Info */}
              <div className="text-left">
                <h4 className="text-xs font-bold leading-tight line-clamp-2">
                  {product?.designation || 'Article IT'}
                </h4>
                <p className="text-[11px] font-mono font-semibold text-slate-600 mt-0.5">
                  SKU: {product?.sku} {product?.brand ? `| ${product.brand}` : ''}
                </p>
              </div>

              {/* Serial Number if applicable */}
              {serial && (
                <div className="bg-slate-900 text-white font-mono text-xs font-bold py-1 px-2 rounded-md tracking-wider">
                  S/N: {serial.serialNumber}
                </div>
              )}

              {/* Barcode & QR code layout */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex-1 flex justify-center overflow-hidden">
                  <svg ref={svgRef} className="w-full h-16"></svg>
                </div>
                {qrUrl && (
                  <img src={qrUrl} alt="QR Code" className="w-16 h-16 rounded border border-slate-200 shrink-0" />
                )}
              </div>

              <div className="text-[9px] text-slate-400 font-mono pt-1">
                Généré le {new Date().toLocaleDateString('fr-FR')} — Traçabilité IT
              </div>
            </div>
          </div>

          {/* Copy Code Button - Hidden in Print */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-xs print:hidden">
            <span className="font-mono text-slate-700 font-semibold">{barcodeText}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier Code'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer - Hidden in Print */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer l'Étiquette</span>
          </button>
        </div>
      </div>
    </div>
  );
};
