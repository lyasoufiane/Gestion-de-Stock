import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Product, SerialItem } from '../types';
import { renderBarcodeSvg } from '../utils/barcodeGenerator';
import { X, QrCode, ScanLine, CheckCircle2, AlertCircle, Plus, Printer, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectSerial?: (serial: SerialItem) => void;
}

export const BarcodeScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectSerial
}) => {
  const [inputCode, setInputCode] = useState('');
  const [scannedHistory, setScannedHistory] = useState<Array<{ code: string; type: string; details: string; timestamp: string }>>([]);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [matchedSerial, setMatchedSerial] = useState<SerialItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInputCode('');
      setMatchedProduct(null);
      setMatchedSerial(null);
      setErrorMsg('');
      setIsCameraActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (matchedProduct && matchedProduct.barcode && barcodeSvgRef.current) {
      renderBarcodeSvg(barcodeSvgRef.current, matchedProduct.barcode, 'CODE128');
    }
  }, [matchedProduct]);

  if (!isOpen) return null;

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = inputCode.trim();
    if (!code) return;

    setErrorMsg('');
    setMatchedProduct(null);
    setMatchedSerial(null);

    // 1. Search by S/N first
    const foundSerial = storageService.getSerialBySN(code);
    if (foundSerial) {
      setMatchedSerial(foundSerial);
      const prod = storageService.getProductById(foundSerial.productId);
      if (prod) setMatchedProduct(prod);

      setScannedHistory(prev => [
        {
          code,
          type: 'S/N Numéro de Série',
          details: `${prod?.designation || 'Équipement'} (Statut: ${foundSerial.status})`,
          timestamp: new Date().toLocaleTimeString('fr-FR')
        },
        ...prev
      ]);
      setInputCode('');
      return;
    }

    // 2. Search by Product Barcode or SKU
    const foundProd = storageService.getProductByBarcode(code) || storageService.getProductBySku(code);
    if (foundProd) {
      setMatchedProduct(foundProd);
      setScannedHistory(prev => [
        {
          code,
          type: 'Code-Barres / SKU Article',
          details: `${foundProd.designation} (Stock: ${foundProd.currentStockQuantity})`,
          timestamp: new Date().toLocaleTimeString('fr-FR')
        },
        ...prev
      ]);
      setInputCode('');
      return;
    }

    // Not found error
    setErrorMsg(`Code "${code}" non reconnu dans le système. Ni S/N, ni Code-Barres, ni SKU trouvé.`);
  };

  const simulateQuickScan = (code: string) => {
    setInputCode(code);
    setTimeout(() => {
      handleScanSubmit();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Scanner Douchette / Code-Barres</h3>
              <p className="text-xs text-slate-400">Scanner séquentiel S/N, EAN-13, Code 128 pour entrées/sorties rapides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Douchette Input Form */}
          <form onSubmit={handleScanSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Champ de Saisie / Flasheur Douchette
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-5 h-5 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Scannez avec la douchette ou saisissez (ex: SN-DELL-982101, 6111234500018)..."
                  className="w-full bg-slate-50 border-2 border-blue-500 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 font-mono font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
              >
                Valider Scan
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              💡 <span className="font-medium">Mode Douchette USB/Bluetooth :</span> Les douchettes Honeywell/Zebra envoient automatiquement la touche "Entrée".
            </p>
          </form>

          {/* Quick Demo Scan Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">
              Tests rapides de simulation de scan :
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => simulateQuickScan('SN-DELL-982101')}
                className="text-xs bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer"
              >
                🔍 S/N: SN-DELL-982101
              </button>
              <button
                type="button"
                onClick={() => simulateQuickScan('6111234500018')}
                className="text-xs bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer"
              >
                📦 EAN: 6111234500018
              </button>
              <button
                type="button"
                onClick={() => simulateQuickScan('PAP-CLAIR-A4')}
                className="text-xs bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer"
              >
                📄 SKU: PAP-CLAIR-A4
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Card: Matched Serial / Product */}
          {matchedProduct && (
            <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    Article Trouvé ({matchedProduct.category})
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {matchedProduct.designation}
                  </h4>
                  <p className="text-xs text-slate-600 font-mono">
                    SKU: {matchedProduct.sku} | Barcode: {matchedProduct.barcode}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Stock Dispo</span>
                  <span className="text-base font-bold text-slate-900">
                    {matchedProduct.currentStockQuantity} {matchedProduct.unit}
                  </span>
                </div>
              </div>

              {matchedSerial && (
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold font-mono text-slate-900">S/N: {matchedSerial.serialNumber}</span>
                      <span className="text-slate-500 ml-2">Garantie: {matchedSerial.warrantyMonths} mois</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-bold rounded-md text-[10px] ${
                    matchedSerial.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                    matchedSerial.status === 'SOLD' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {matchedSerial.status}
                  </span>
                </div>
              )}

              {/* Barcode Render */}
              <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-center">
                <svg ref={barcodeSvgRef} className="max-w-full h-16"></svg>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {onSelectProduct && (
                  <button
                    onClick={() => {
                      onSelectProduct(matchedProduct);
                      onClose();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Sélectionner pour Mouvement
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sequential Scanning History Log */}
          {scannedHistory.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Historique des Scans de la session ({scannedHistory.length})</span>
                <button
                  onClick={() => setScannedHistory([])}
                  className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  Effacer
                </button>
              </h5>
              <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50 text-xs">
                {scannedHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono font-bold text-slate-900">{item.code}</span>
                      <span className="text-slate-500 text-[11px]">({item.type})</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
