import React from 'react';
import { storageService } from '../services/storageService';
import { ViewTab } from '../components/Header';
import { generateMovementPdf } from '../utils/pdfGenerator';
import { ProductCategory } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  Package,
  Barcode,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  FileText,
  Warehouse,
  ChevronRight,
  TrendingUp,
  Download,
  PieChart as PieIcon,
  BarChart3,
  Truck,
  Plus
} from 'lucide-react';

interface Props {
  onNavigate: (tab: ViewTab) => void;
  onOpenScanner: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Matériel Identifiable': '#8b5cf6', // Purple
  'Consommables & Fournitures': '#f59e0b', // Amber
  'Accessoires & Connectique': '#3b82f6'  // Blue
};

export const DashboardView: React.FC<Props> = ({ onNavigate, onOpenScanner }) => {
  const products = storageService.getProducts();
  const serials = storageService.getSerials();
  const movements = storageService.getMovements();
  const suggestions = storageService.getPurchaseSuggestions();

  // Metrics calculations
  const totalStockItems = products.reduce((acc, p) => acc + p.currentStockQuantity, 0);
  const totalStockValueHT = products.reduce((acc, p) => acc + (p.currentStockQuantity * p.pricing.purchasePriceHT), 0);
  const totalSellingValueHT = products.reduce((acc, p) => acc + (p.currentStockQuantity * p.pricing.publicSellingPriceHT), 0);
  const activeSerialsCount = serials.filter(s => s.status === 'IN_STOCK').length;

  const lowStockProducts = products.filter(p => p.currentStockQuantity < p.minStockThreshold);

  // Category distribution data for charts
  const categories: ProductCategory[] = [
    'Matériel Identifiable',
    'Consommables & Fournitures',
    'Accessoires & Connectique'
  ];

  const categoryChartData = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const totalQty = catProducts.reduce((acc, p) => acc + p.currentStockQuantity, 0);
    const totalValueHT = catProducts.reduce((acc, p) => acc + (p.currentStockQuantity * p.pricing.purchasePriceHT), 0);
    const totalSellingHT = catProducts.reduce((acc, p) => acc + (p.currentStockQuantity * p.pricing.publicSellingPriceHT), 0);

    return {
      name: cat,
      shortName: cat === 'Matériel Identifiable' ? 'Matériel IT' : cat === 'Consommables & Fournitures' ? 'Consommables' : 'Accessoires',
      quantity: totalQty,
      valueHT: totalValueHT,
      sellingHT: totalSellingHT,
      refCount: catProducts.length,
      fill: CATEGORY_COLORS[cat] || '#64748b'
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if low stock exists */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-900 rounded-xl font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alerte Réapprovisionnement : {lowStockProducts.length} référence(s) sous le seuil critique !
              </h3>
              <p className="text-xs text-slate-600">
                Notamment : Papier A4 ({products.find(p => p.sku === 'PAP-CLAIR-A4')?.currentStockQuantity} / 50 cartons), Toners HP, Câbles.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('purchasing')}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <span>Tableau de bord d'Achat</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">Accès Rapide</span>
          <span className="text-slate-500">Raccourcis Opérationnels</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('suppliers')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Truck className="w-4 h-4 text-blue-400" />
            <span>Ajouter / Gérer Fournisseurs</span>
          </button>

          <button
            onClick={() => onNavigate('movements')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Nouveau BR (Réception)</span>
          </button>

          <button
            onClick={() => onNavigate('movements')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Nouveau BL (Expédition)</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-slate-300"
          >
            <Barcode className="w-4 h-4 text-slate-600" />
            <span>Scanner Douchette</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Valeur du Stock HT</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalStockValueHT.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-500">DH</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Valeur Vente HT: {totalSellingValueHT.toLocaleString('fr-FR')} DH</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Articles en Stock</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalStockItems.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-500">unités</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {products.length} références catalogue enregistrées
            </div>
          </div>
        </div>

        {/* Card 3: Active Serials S/N */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">S/N Équipements Traçables</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Barcode className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {activeSerialsCount} <span className="text-sm font-normal text-slate-500">en stock</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Suivi individuel + Garantie constructeur
            </div>
          </div>
        </div>

        {/* Card 4: Low stock alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Seuil Critique Achat</span>
            <div className={`p-2 rounded-xl ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {lowStockProducts.length} <span className="text-sm font-normal text-slate-500">alertes</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Commandes fournisseur suggérées
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics / Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Stock Quantity Distribution (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Répartition par Volume (Quantité)</h3>
                <p className="text-xs text-slate-500">Proportion d'unités physiques en stock par catégorie</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              {totalStockItems} Unités
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="quantity"
                  nameKey="name"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString('fr-FR')} unités (${((Number(value) / totalStockItems) * 100).toFixed(1)}%)`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial Stock Value Distribution (Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Valeur Financière HT (DH)</h3>
                <p className="text-xs text-slate-500">Comparatif Valeur d'Achat HT vs Valeur de Vente HT</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
              {totalStockValueHT.toLocaleString('fr-FR')} DH HT
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k DH`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString('fr-FR')} DH HT`,
                    name === 'valueHT' ? 'Valeur Achat HT' : 'Valeur Vente HT'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-700">
                      {value === 'valueHT' ? "Achat HT (Investissement)" : "Vente HT (Valeur Marchande)"}
                    </span>
                  )}
                />
                <Bar dataKey="valueHT" name="valueHT" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sellingHT" name="sellingHT" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categories Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category 1: Matériel Identifiable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Matériel Identifiable</h4>
              <p className="text-[11px] text-slate-500">PC, Écrans, Serveurs, Imprimantes</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-md">
              S/N Unique
            </span>
          </div>
          <div className="space-y-2">
            {products.filter(p => p.category === 'Matériel Identifiable').map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                <span className="truncate max-w-[200px] font-medium text-slate-800">{p.designation}</span>
                <span className="font-mono font-bold text-slate-900">{p.currentStockQuantity} un.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category 2: Consommables & Fournitures */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Consommables & Fournitures</h4>
              <p className="text-[11px] text-slate-500">Toners, Encre, Papier A4</p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">
              Lots & Seuil Min
            </span>
          </div>
          <div className="space-y-2">
            {products.filter(p => p.category === 'Consommables & Fournitures').map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                <span className="truncate max-w-[200px] font-medium text-slate-800">{p.designation}</span>
                <span className={`font-mono font-bold ${p.currentStockQuantity < p.minStockThreshold ? 'text-amber-600' : 'text-slate-900'}`}>
                  {p.currentStockQuantity} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: Accessoires & Connectique */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Accessoires & Connectique</h4>
              <p className="text-[11px] text-slate-500">Câbles, Hubs, Souris, Claviers</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-md">
              Quantitatif SKU
            </span>
          </div>
          <div className="space-y-2">
            {products.filter(p => p.category === 'Accessoires & Connectique').map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                <span className="truncate max-w-[200px] font-medium text-slate-800">{p.designation}</span>
                <span className="font-mono font-bold text-slate-900">{p.currentStockQuantity} un.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Movements Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Derniers Mouvements de Stock (BR / BL)</h3>
            <p className="text-xs text-slate-500">Réceptions fournisseurs & expéditions clients récents</p>
          </div>
          <button
            onClick={() => onNavigate('movements')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tous les mouvements</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {movements.slice(0, 5).map(m => (
            <div key={m.id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl font-bold ${
                  m.type === 'ENTREE_BR' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {m.type === 'ENTREE_BR' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{m.reference}</span>
                    <span className="text-xs text-slate-500">• {m.partyName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {m.items.map(i => `${i.productSku} (x${i.quantity})`).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">{m.date}</span>
                <button
                  onClick={() => generateMovementPdf(m)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Télécharger Bon PDF (BR/BL)"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

