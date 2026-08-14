import React, { useState, useEffect } from 'react';
import { UserRole, Product } from './types';
import { storageService, subscribeToStorage } from './services/storageService';
import { Header, ViewTab } from './components/Header';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SerialTraceabilityModal } from './components/SerialTraceabilityModal';
import { DashboardView } from './views/DashboardView';
import { CatalogView } from './views/CatalogView';
import { SerialTraceabilityView } from './views/SerialTraceabilityView';
import { MovementsView } from './views/MovementsView';
import { InventoryView } from './views/InventoryView';
import { PurchasingView } from './views/PurchasingView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Global S/N Modal trigger
  const [activeSerialObj, setActiveSerialObj] = useState<any>(null);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);

  // Force re-render on state changes
  const [, setTick] = useState(0);

  useEffect(() => {
    setCurrentRole(storageService.getRole());
    const unsubscribe = subscribeToStorage(() => {
      setTick(t => t + 1);
      setCurrentRole(storageService.getRole());
    });
    return unsubscribe;
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    storageService.setRole(role);
  };

  const handleOpenSerialModalForProduct = (product: Product) => {
    const serials = storageService.getSerialsByProductId(product.id);
    if (serials.length > 0) {
      setActiveSerialObj(serials[0]);
      setIsSerialModalOpen(true);
    } else {
      alert(`Aucun numéro de série enregistré pour l'article ${product.sku}`);
    }
  };

  const suggestions = storageService.getPurchaseSuggestions();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
      {/* Global Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        lowStockCount={suggestions.length}
        onOpenScanner={() => setIsScannerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Workspace Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogView
            currentRole={currentRole}
            searchQuery={searchQuery}
            onOpenSerialModal={handleOpenSerialModalForProduct}
          />
        )}

        {activeTab === 'traceability' && (
          <SerialTraceabilityView searchQuery={searchQuery} />
        )}

        {activeTab === 'movements' && (
          <MovementsView
            currentRole={currentRole}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            currentRole={currentRole}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'purchasing' && (
          <PurchasingView currentRole={currentRole} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div>
            © 2026 <span className="text-white font-semibold">Gestion de Stock & Inventaire IT Maroc</span> — Distribution Matériel & Consommables Informatiques
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Traçabilité S/N • Lots & Cartons • Scan Douchette • PDF BR/BL
          </div>
        </div>
      </footer>

      {/* Global Douchette / Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProduct={(p) => {
          setActiveTab('catalog');
        }}
        onSelectSerial={(s) => {
          setActiveSerialObj(s);
          setIsSerialModalOpen(true);
        }}
      />

      {/* Global S/N Traceability Modal */}
      <SerialTraceabilityModal
        isOpen={isSerialModalOpen}
        onClose={() => setIsSerialModalOpen(false)}
        serial={activeSerialObj}
      />
    </div>
  );
}
