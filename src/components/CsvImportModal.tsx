import React, { useState, useRef } from 'react';
import { Product, ProductCategory, TrackingType } from '../types';
import { storageService } from '../services/storageService';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  RefreshCw,
  Info,
  Package,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export interface ParsedProductRow {
  rowNumber: number;
  sku: string;
  designation: string;
  brand: string;
  model: string;
  category: ProductCategory;
  subcategory: string;
  barcode: string;
  warehouse: string;
  aisle: string;
  shelf: string;
  purchasePriceHT: number;
  publicSellingPriceHT: number;
  publicSellingPriceTTC: number;
  minStockThreshold: number;
  currentStockQuantity: number;
  trackingType: TrackingType;
  unit: string;

  // Validation
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isExistingSku: boolean;
  existingProductId?: string;
}

export const CsvImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'ERROR' | 'WARNING'>('ALL');
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  // Download CSV template
  const handleDownloadTemplate = () => {
    const csvContent =
      'SKU;Designation;Marque;Model;Categorie;SousCategorie;CodeBarre;PrixAchatHT;PrixVenteHT;PrixVenteTTC;StockInitial;SeuilMin;Entrepot;Allee;Etagere;TypeSuivi;Unite\n' +
      'LAP-DELL-5540;PC Portable Dell Latitude 5540 i7 16GB;Dell;Latitude 5540;Matériel Identifiable;PC Portables;6112233445566;8500;10500;12600;8;3;Dépôt Principal - Casablanca;Allée A;Étagère 1;SERIAL_NUMBER;Unité\n' +
      'TON-HP-W2030A;Cartouche Toner HP 415A Noir;HP;415A;Consommables & Fournitures;Toners Laser;6119988776655;650;850;1020;45;15;Dépôt Principal - Casablanca;Allée B;Étagère 3;BATCH_LOT;Unité\n' +
      'CAB-RJ45-5M;Câble Réseau RJ45 Cat6 F/UTP 5m;Générique;Cat6;Accessoires & Connectique;Câblage;6114455667788;25;45;54;120;25;Dépôt Principal - Casablanca;Allée C;Étagère 2;QUANTITY_SKU;Unité\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Modele_Import_Catalogue_Produits.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to normalize and match category string
  const normalizeCategory = (inputCat: string): { category: ProductCategory; warning?: string } => {
    const raw = (inputCat || '').trim().toLowerCase();
    if (raw.includes('matériel') || raw.includes('materiel') || raw.includes('identifiable') || raw.includes('pc') || raw.includes('serveur') || raw.includes('écran')) {
      return { category: 'Matériel Identifiable' };
    }
    if (raw.includes('consommable') || raw.includes('fourniture') || raw.includes('toner') || raw.includes('encre') || raw.includes('papier')) {
      return { category: 'Consommables & Fournitures' };
    }
    if (raw.includes('accessoire') || raw.includes('connectique') || raw.includes('câble') || raw.includes('cable') || raw.includes('reseau')) {
      return { category: 'Accessoires & Connectique' };
    }
    if (!inputCat || inputCat.trim() === '') {
      return { category: 'Accessoires & Connectique', warning: 'Catégorie absente: attribué par défaut à "Accessoires & Connectique"' };
    }
    return { category: 'Accessoires & Connectique', warning: `Catégorie "${inputCat}" inconnue: attribué à "Accessoires & Connectique"` };
  };

  // Helper to normalize tracking type
  const normalizeTrackingType = (inputTrack: string): TrackingType => {
    const raw = (inputTrack || '').trim().toUpperCase();
    if (raw === 'SERIAL_NUMBER' || raw === 'SERIAL' || raw === 'SN' || raw.includes('SÉRIE') || raw.includes('SERIE')) {
      return 'SERIAL_NUMBER';
    }
    if (raw === 'BATCH_LOT' || raw === 'LOT' || raw === 'BATCH' || raw.includes('LOT')) {
      return 'BATCH_LOT';
    }
    return 'QUANTITY_SKU';
  };

  // CSV Line Parser handling quotes and delimiters
  const parseCSVLine = (text: string, delimiter: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const processFileContent = (content: string) => {
    setRawText(content);
    const existingProducts = storageService.getProducts();

    const lines = content
      .split(/\r\n|\n|\r/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine delimiter: ;, or tab or ,
    const firstLine = lines[0];
    let delimiter = ';';
    if ((firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length) {
      delimiter = ';';
    } else if ((firstLine.match(/\t/g) || []).length > 0) {
      delimiter = '\t';
    } else {
      delimiter = ',';
    }

    const headers = parseCSVLine(firstLine, delimiter).map(h => h.toLowerCase().replace(/[^a-z0-0_]/g, ''));

    // Map header indices
    const getIndex = (keywords: string[]): number => {
      return headers.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const idxSku = getIndex(['sku', 'ref', 'reference', 'code_article']);
    const idxDesignation = getIndex(['designation', 'nom', 'article', 'description', 'title', 'produit']);
    const idxBrand = getIndex(['marque', 'brand', 'fabricant']);
    const idxModel = getIndex(['modele', 'model']);
    const idxCategory = getIndex(['categorie', 'category', 'cat']);
    const idxSubcategory = getIndex(['souscategorie', 'subcategory', 'famille', 'sous_famille']);
    const idxBarcode = getIndex(['codebarre', 'barcode', 'ean', 'upc', 'code_barre']);
    const idxPurchasePrice = getIndex(['prixachat', 'pump', 'cost', 'prix_achat', 'achat']);
    const idxSellingPrice = getIndex(['prixventeht', 'prixvente', 'price', 'prix_vente', 'pv_ht']);
    const idxSellingPriceTTC = getIndex(['prixventettc', 'ttc', 'pv_ttc']);
    const idxStock = getIndex(['stockinitial', 'stock', 'quantite', 'qty', 'currentstock']);
    const idxMinStock = getIndex(['seuilmin', 'seuil', 'minstock', 'alerte']);
    const idxWarehouse = getIndex(['entrepot', 'warehouse', 'depot']);
    const idxAisle = getIndex(['allee', 'aisle', 'rayon']);
    const idxShelf = getIndex(['etagere', 'shelf', 'niveau']);
    const idxTracking = getIndex(['typesuivi', 'tracking', 'suivi', 'trackingtype']);
    const idxUnit = getIndex(['unite', 'unit']);

    const rows: ParsedProductRow[] = [];
    const seenSkusInCsv = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const cols = parseCSVLine(line, delimiter);
      const rowNum = i + 1; // 1-based index including header

      const errors: string[] = [];
      const warnings: string[] = [];

      // Extract raw values
      const rawSku = (idxSku !== -1 && cols[idxSku] ? cols[idxSku] : (cols[0] || '')).trim();
      const rawDesignation = (idxDesignation !== -1 && cols[idxDesignation] ? cols[idxDesignation] : (cols[1] || '')).trim();
      const rawBrand = (idxBrand !== -1 && cols[idxBrand] ? cols[idxBrand] : '').trim() || 'Générique';
      const rawModel = (idxModel !== -1 && cols[idxModel] ? cols[idxModel] : '').trim() || 'Standard';
      const rawCategoryStr = (idxCategory !== -1 && cols[idxCategory] ? cols[idxCategory] : '').trim();
      const rawSubcategory = (idxSubcategory !== -1 && cols[idxSubcategory] ? cols[idxSubcategory] : '').trim() || 'Divers';
      const rawBarcode = (idxBarcode !== -1 && cols[idxBarcode] ? cols[idxBarcode] : '').trim();
      const rawPurchasePrice = (idxPurchasePrice !== -1 && cols[idxPurchasePrice] ? cols[idxPurchasePrice] : '0').replace(',', '.').trim();
      const rawSellingPrice = (idxSellingPrice !== -1 && cols[idxSellingPrice] ? cols[idxSellingPrice] : '0').replace(',', '.').trim();
      const rawSellingPriceTTC = (idxSellingPriceTTC !== -1 && cols[idxSellingPriceTTC] ? cols[idxSellingPriceTTC] : '0').replace(',', '.').trim();
      const rawStock = (idxStock !== -1 && cols[idxStock] ? cols[idxStock] : '0').trim();
      const rawMinStock = (idxMinStock !== -1 && cols[idxMinStock] ? cols[idxMinStock] : '5').trim();
      const rawWarehouse = (idxWarehouse !== -1 && cols[idxWarehouse] ? cols[idxWarehouse] : '').trim() || 'Dépôt Principal - Casablanca';
      const rawAisle = (idxAisle !== -1 && cols[idxAisle] ? cols[idxAisle] : '').trim() || 'Allée A';
      const rawShelf = (idxShelf !== -1 && cols[idxShelf] ? cols[idxShelf] : '').trim() || 'Étagère 1';
      const rawTracking = (idxTracking !== -1 && cols[idxTracking] ? cols[idxTracking] : '').trim();
      const rawUnit = (idxUnit !== -1 && cols[idxUnit] ? cols[idxUnit] : '').trim() || 'Unité';

      // VALIDATIONS
      // 1. SKU validation
      if (!rawSku) {
        errors.push('SKU / Référence obligatoire manquant');
      } else {
        if (seenSkusInCsv.has(rawSku.toLowerCase())) {
          errors.push(`SKU "${rawSku}" présent plusieurs fois dans ce fichier CSV`);
        } else {
          seenSkusInCsv.add(rawSku.toLowerCase());
        }
      }

      // Check if SKU exists in existing database
      const existingProduct = existingProducts.find(p => p.sku.toLowerCase() === rawSku.toLowerCase());
      const isExistingSku = !!existingProduct;
      if (isExistingSku) {
        warnings.push(`SKU "${rawSku}" existe déjà en base de données. Il sera mis à jour si l'option de surécriture est cochée.`);
      }

      // 2. Designation validation
      if (!rawDesignation) {
        errors.push('Désignation de l\'article obligatoire manquante');
      }

      // 3. Category matching & warnings
      const catRes = normalizeCategory(rawCategoryStr);
      if (catRes.warning) {
        warnings.push(catRes.warning);
      }

      // 4. Numeric parsing & validations
      const purchasePriceHT = parseFloat(rawPurchasePrice);
      if (isNaN(purchasePriceHT) || purchasePriceHT < 0) {
        errors.push(`Prix d'achat HT invalide ("${rawPurchasePrice}")`);
      }

      let publicSellingPriceHT = parseFloat(rawSellingPrice);
      if (isNaN(publicSellingPriceHT) || publicSellingPriceHT < 0) {
        errors.push(`Prix de vente HT invalide ("${rawSellingPrice}")`);
      }

      if (!isNaN(purchasePriceHT) && !isNaN(publicSellingPriceHT) && publicSellingPriceHT < purchasePriceHT) {
        warnings.push(`Attention : Prix de vente HT (${publicSellingPriceHT} DH) inférieur au prix d'achat HT (${purchasePriceHT} DH)`);
      }

      let publicSellingPriceTTC = parseFloat(rawSellingPriceTTC);
      if (isNaN(publicSellingPriceTTC) || publicSellingPriceTTC <= 0) {
        publicSellingPriceTTC = Math.round(publicSellingPriceHT * 1.20 * 100) / 100; // Auto 20% TVA
      }

      const currentStockQuantity = parseInt(rawStock, 10);
      if (isNaN(currentStockQuantity) || currentStockQuantity < 0) {
        errors.push(`Quantité de stock initiale invalide ("${rawStock}")`);
      }

      const minStockThreshold = parseInt(rawMinStock, 10);
      if (isNaN(minStockThreshold) || minStockThreshold < 0) {
        warnings.push(`Seuil min invalide ("${rawMinStock}"), réglé à 5 par défaut`);
      }

      const trackingType = normalizeTrackingType(rawTracking);
      const barcode = rawBarcode || `611${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      rows.push({
        rowNumber: rowNum,
        sku: rawSku,
        designation: rawDesignation,
        brand: rawBrand,
        model: rawModel,
        category: catRes.category,
        subcategory: rawSubcategory,
        barcode,
        warehouse: rawWarehouse,
        aisle: rawAisle,
        shelf: rawShelf,
        purchasePriceHT: isNaN(purchasePriceHT) ? 0 : purchasePriceHT,
        publicSellingPriceHT: isNaN(publicSellingPriceHT) ? 0 : publicSellingPriceHT,
        publicSellingPriceTTC,
        minStockThreshold: isNaN(minStockThreshold) || minStockThreshold < 0 ? 5 : minStockThreshold,
        currentStockQuantity: isNaN(currentStockQuantity) ? 0 : currentStockQuantity,
        trackingType,
        unit: rawUnit,
        isValid: errors.length === 0,
        errors,
        warnings,
        isExistingSku,
        existingProductId: existingProduct?.id
      });
    }

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processFileContent(text || '');
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setImportSuccessMsg('');
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text || '');
      };
      reader.readAsText(droppedFile, 'UTF-8');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Execution of Bulk Import
  const handleExecuteImport = () => {
    setIsImporting(true);

    const rowsToImport = parsedRows.filter(r => r.isValid && (!r.isExistingSku || overwriteExisting));

    if (rowsToImport.length === 0) {
      setIsImporting(false);
      alert('Aucune ligne valide à importer selon vos paramètres actuels.');
      return;
    }

    let createdCount = 0;
    let updatedCount = 0;

    rowsToImport.forEach(r => {
      const productPayload: Partial<Product> & { designation: string; category: ProductCategory } = {
        id: r.isExistingSku && overwriteExisting ? r.existingProductId : undefined,
        sku: r.sku,
        designation: r.designation,
        brand: r.brand,
        model: r.model,
        category: r.category,
        subcategory: r.subcategory,
        barcode: r.barcode,
        location: {
          warehouse: r.warehouse,
          aisle: r.aisle,
          shelf: r.shelf
        },
        pricing: {
          purchasePriceHT: r.purchasePriceHT,
          publicSellingPriceHT: r.publicSellingPriceHT,
          publicSellingPriceTTC: r.publicSellingPriceTTC,
          resellerPriceHT: Math.round(r.publicSellingPriceHT * 0.85) // Auto 15% discount for reseller
        },
        minStockThreshold: r.minStockThreshold,
        currentStockQuantity: r.currentStockQuantity,
        trackingType: r.trackingType,
        unit: r.unit
      };

      storageService.saveProduct(productPayload);
      if (r.isExistingSku && overwriteExisting) {
        updatedCount++;
      } else {
        createdCount++;
      }
    });

    setIsImporting(false);
    setImportSuccessMsg(`Importation réussie : ${createdCount} article(s) créé(s), ${updatedCount} article(s) mis à jour !`);

    setTimeout(() => {
      onImportComplete();
      onClose();
    }, 1500);
  };

  // Stats calculation
  const totalRows = parsedRows.length;
  const validRows = parsedRows.filter(r => r.isValid);
  const errorRows = parsedRows.filter(r => !r.isValid);
  const warningRows = parsedRows.filter(r => r.isValid && r.warnings.length > 0);

  const displayedRows = parsedRows.filter(r => {
    if (filterStatus === 'VALID') return r.isValid;
    if (filterStatus === 'ERROR') return !r.isValid;
    if (filterStatus === 'WARNING') return r.isValid && r.warnings.length > 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Importation Catalogue Produits via CSV</h3>
              <p className="text-xs text-slate-400">Validation automatique des données, SKUs, prix et catégories</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Success Banner */}
          {importSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {/* File Select & Template Download */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {file ? file.name : 'Cliquez ou glissez-déposez un fichier CSV ici'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Prise en charge des séparateurs point-virgule (;) ou virgule (,) — Encodage UTF-8
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Template Download Box */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>Modèle Prêt à l'Emploi</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Téléchargez notre fichier modèle CSV pré-formaté avec les entêtes exacts et des exemples complets.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Modèle CSV</span>
              </button>
            </div>
          </div>

          {/* Parsed Results Overview */}
          {totalRows > 0 && (
            <div className="space-y-4">
              {/* Summary KPIs & Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">{totalRows} ligne(s) analysée(s) :</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{validRows.length} Valides</span>
                  {errorRows.length > 0 && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">{errorRows.length} Erreurs</span>}
                  {warningRows.length > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{warningRows.length} Avertissements</span>}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                  >
                    Toutes ({totalRows})
                  </button>
                  <button
                    onClick={() => setFilterStatus('VALID')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${filterStatus === 'VALID' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                  >
                    Valides ({validRows.length})
                  </button>
                  {errorRows.length > 0 && (
                    <button
                      onClick={() => setFilterStatus('ERROR')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${filterStatus === 'ERROR' ? 'bg-red-600 text-white' : 'text-slate-600'}`}
                    >
                      Erreurs ({errorRows.length})
                    </button>
                  )}
                  {warningRows.length > 0 && (
                    <button
                      onClick={() => setFilterStatus('WARNING')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${filterStatus === 'WARNING' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
                    >
                      Alertes ({warningRows.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Duplicate SKU Overwrite Option */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900">
                <input
                  type="checkbox"
                  id="overwriteSku"
                  checked={overwriteExisting}
                  onChange={e => setOverwriteExisting(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="overwriteSku" className="cursor-pointer font-medium">
                  Mettre à jour les articles existants en base si le SKU est déjà présent (remplace les prix et stocks)
                </label>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 bg-slate-100 z-10">
                        <th className="py-2.5 px-3 w-12 text-center">Ligne</th>
                        <th className="py-2.5 px-3 w-24">Statut</th>
                        <th className="py-2.5 px-3 font-mono">SKU</th>
                        <th className="py-2.5 px-3">Désignation</th>
                        <th className="py-2.5 px-3">Catégorie</th>
                        <th className="py-2.5 px-3 text-right">Stock</th>
                        <th className="py-2.5 px-3 text-right">P.Achat HT</th>
                        <th className="py-2.5 px-3 text-right">P.Vente HT</th>
                        <th className="py-2.5 px-3">Diagnostic & Validation</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.map(row => (
                        <tr
                          key={row.rowNumber}
                          className={`hover:bg-slate-50 transition-colors ${
                            !row.isValid ? 'bg-red-50/50' : row.warnings.length > 0 ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-500">
                            #{row.rowNumber}
                          </td>

                          <td className="py-2.5 px-3">
                            {!row.isValid ? (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                <XCircle className="w-3 h-3 text-red-600" /> ERREUR
                              </span>
                            ) : row.warnings.length > 0 ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> ALERTE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VALIDE
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                            {row.sku || '-'}
                          </td>

                          <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                            {row.designation || '-'}
                          </td>

                          <td className="py-2.5 px-3 text-slate-700">
                            {row.category}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {row.currentStockQuantity}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {row.purchasePriceHT.toLocaleString('fr-FR')} DH
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {row.publicSellingPriceHT.toLocaleString('fr-FR')} DH
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="space-y-0.5 text-[11px]">
                              {row.errors.map((err, idx) => (
                                <p key={idx} className="text-red-600 font-bold flex items-center gap-1">
                                  <span>•</span> {err}
                                </p>
                              ))}
                              {row.warnings.map((warn, idx) => (
                                <p key={idx} className="text-amber-700 font-medium flex items-center gap-1">
                                  <span>•</span> {warn}
                                </p>
                              ))}
                              {row.isValid && row.warnings.length === 0 && (
                                <p className="text-emerald-600 font-medium">Ligne conforme</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {displayedRows.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-500">
                            Aucune ligne ne correspond aux filtres sélectionnés.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={isImporting || totalRows === 0 || validRows.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>
              Importer {validRows.length} Article(s) Valide(s)
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
