import {
  UserRole,
  Product,
  SerialItem,
  BatchLotItem,
  StockMovement,
  InventoryAudit,
  PurchaseSuggestion,
  AuditLog,
  UserPermissions,
  CompanyProfile,
  Supplier,
  Warehouse
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SERIALS,
  INITIAL_LOTS,
  INITIAL_MOVEMENTS,
  INITIAL_AUDITS,
  INITIAL_AUDIT_LOGS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_SUPPLIERS,
  INITIAL_WAREHOUSES
} from '../data/initialData';

const KEYS = {
  ROLE: 'it_stock_user_role',
  PRODUCTS: 'it_stock_products',
  SERIALS: 'it_stock_serials',
  LOTS: 'it_stock_lots',
  MOVEMENTS: 'it_stock_movements',
  AUDITS: 'it_stock_audits',
  LOGS: 'it_stock_logs',
  COMPANY_PROFILE: 'it_stock_company_profile',
  SUPPLIERS: 'it_stock_suppliers',
  WAREHOUSES: 'it_stock_warehouses'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach(cb => cb());
}

export const subscribeToStorage = (cb: Listener) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'ADMIN':
      return {
        consultStock: true,
        inOutMovements: 'ALL',
        validateInventory: 'FULL',
        priceAndPurchaseAccess: 'FULL',
        systemAdmin: true
      };
    case 'PURCHASE_MGR':
      return {
        consultStock: true,
        inOutMovements: 'ALL',
        validateInventory: 'FULL',
        priceAndPurchaseAccess: 'FULL',
        systemAdmin: false
      };
    case 'WAREHOUSE_AGENT':
      return {
        consultStock: true,
        inOutMovements: 'ALL',
        validateInventory: 'INPUT_ONLY', // Saisie seule
        priceAndPurchaseAccess: 'NONE',   // Non
        systemAdmin: false
      };
    case 'SALES':
      return {
        consultStock: true,
        inOutMovements: 'READ_ONLY',     // Lecture seule (Devis/Consultation)
        validateInventory: 'NONE',      // Non
        priceAndPurchaseAccess: 'SELLING_PRICE_ONLY', // Prix de vente seul
        systemAdmin: false
      };
  }
};

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error loading key ${key}`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      notify();
    } catch (e) {
      console.error(`Error saving key ${key}`, e);
    }
  }

  // --- ROLE ---
  getRole(): UserRole {
    return this.getItem<UserRole>(KEYS.ROLE, 'ADMIN');
  }

  setRole(role: UserRole): void {
    this.setItem(KEYS.ROLE, role);
    this.logAction('CHANGE_ROLE', `Rôle utilisateur changé vers: ${role}`);
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return this.getItem<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  getProductBySku(sku: string): Product | undefined {
    return this.getProducts().find(p => p.sku.toLowerCase() === sku.toLowerCase());
  }

  getProductByBarcode(code: string): Product | undefined {
    return this.getProducts().find(p => p.barcode === code);
  }

  saveProduct(product: Partial<Product> & { designation: string; category: Product['category'] }): Product {
    const products = this.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        const updated: Product = {
          ...products[index],
          ...product,
          updatedAt: now
        };
        products[index] = updated;
        this.setItem(KEYS.PRODUCTS, products);
        this.logAction('UPDATE_PRODUCT', `Fiche article mise à jour: ${updated.sku} - ${updated.designation}`);
        return updated;
      }
    }

    // New product
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: product.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: product.designation,
      brand: product.brand || 'Générique',
      model: product.model || 'Standard',
      category: product.category,
      subcategory: product.subcategory || 'Divers',
      barcode: product.barcode || `611${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      location: product.location || { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée A', shelf: 'Étagère 1' },
      pricing: product.pricing || { purchasePriceHT: 0, publicSellingPriceHT: 0, publicSellingPriceTTC: 0, resellerPriceHT: 0 },
      minStockThreshold: product.minStockThreshold ?? 5,
      currentStockQuantity: product.currentStockQuantity ?? 0,
      reservedQuantity: 0,
      inTransitQuantity: 0,
      trackingType: product.trackingType || 'QUANTITY_SKU',
      warrantyMonths: product.warrantyMonths,
      unit: product.unit || 'Unité',
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80',
      createdAt: now,
      updatedAt: now
    };

    products.push(newProduct);
    this.setItem(KEYS.PRODUCTS, products);
    this.logAction('CREATE_PRODUCT', `Nouvel article créé: ${newProduct.sku} - ${newProduct.designation}`);
    return newProduct;
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setItem(KEYS.PRODUCTS, products);
    this.logAction('DELETE_PRODUCT', `Article supprimé ID: ${id}`);
  }

  // --- SERIALS ---
  getSerials(): SerialItem[] {
    return this.getItem<SerialItem[]>(KEYS.SERIALS, INITIAL_SERIALS);
  }

  getSerialsByProductId(productId: string): SerialItem[] {
    return this.getSerials().filter(s => s.productId === productId);
  }

  getSerialBySN(sn: string): SerialItem | undefined {
    return this.getSerials().find(s => s.serialNumber.toLowerCase() === sn.toLowerCase());
  }

  addSerial(serial: Omit<SerialItem, 'id'>): SerialItem {
    const serials = this.getSerials();
    const newSerial: SerialItem = {
      ...serial,
      id: `sn-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    serials.push(newSerial);
    this.setItem(KEYS.SERIALS, serials);

    // Recalculate stock for product
    this.recalculateProductStock(serial.productId);
    this.logAction('ADD_SERIAL', `Numéro de série enregistré: ${newSerial.serialNumber}`);
    return newSerial;
  }

  updateSerialStatus(id: string, status: SerialItem['status'], buyerName?: string, blRef?: string): void {
    const serials = this.getSerials();
    const index = serials.findIndex(s => s.id === id);
    if (index !== -1) {
      serials[index].status = status;
      if (buyerName) serials[index].buyerClientName = buyerName;
      if (blRef) serials[index].exitDeliveryNoteRef = blRef;
      if (status === 'SOLD') serials[index].saleDate = new Date().toISOString().split('T')[0];

      this.setItem(KEYS.SERIALS, serials);
      this.recalculateProductStock(serials[index].productId);
      this.logAction('UPDATE_SERIAL_STATUS', `Statut S/N ${serials[index].serialNumber} mis à jour -> ${status}`);
    }
  }

  // --- BATCH LOTS ---
  getLots(): BatchLotItem[] {
    return this.getItem<BatchLotItem[]>(KEYS.LOTS, INITIAL_LOTS);
  }

  getLotsByProductId(productId: string): BatchLotItem[] {
    return this.getLots().filter(l => l.productId === productId);
  }

  addLot(lot: Omit<BatchLotItem, 'id'>): BatchLotItem {
    const lots = this.getLots();
    const newLot: BatchLotItem = {
      ...lot,
      id: `lot-${Date.now()}`
    };
    lots.push(newLot);
    this.setItem(KEYS.LOTS, lots);
    this.recalculateProductStock(lot.productId);
    this.logAction('ADD_LOT', `Nouveau lot enregistré: ${newLot.lotNumber} (${newLot.quantity} unités)`);
    return newLot;
  }

  // Recalculate product stock from S/Ns or Lots or Direct Quantity
  private recalculateProductStock(productId: string): void {
    const products = this.getProducts();
    const prodIndex = products.findIndex(p => p.id === productId);
    if (prodIndex === -1) return;

    const product = products[prodIndex];
    if (product.trackingType === 'SERIAL_NUMBER') {
      const serials = this.getSerialsByProductId(productId);
      const inStockCount = serials.filter(s => s.status === 'IN_STOCK').length;
      const reservedCount = serials.filter(s => s.status === 'RESERVED').length;
      product.currentStockQuantity = inStockCount;
      product.reservedQuantity = reservedCount;
    } else if (product.trackingType === 'BATCH_LOT') {
      const lots = this.getLotsByProductId(productId);
      const totalQuantity = lots.reduce((acc, l) => acc + l.quantity, 0);
      product.currentStockQuantity = totalQuantity;
    }

    products[prodIndex] = product;
    this.setItem(KEYS.PRODUCTS, products);
  }

  // --- MOVEMENTS ---
  getMovements(): StockMovement[] {
    return this.getItem<StockMovement[]>(KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  }

  createMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement {
    const movements = this.getMovements();
    const newMov: StockMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    movements.unshift(newMov);
    this.setItem(KEYS.MOVEMENTS, movements);

    // Apply movement impact on stock if validated
    if (newMov.status === 'VALIDATED') {
      this.applyMovementToStock(newMov);
    }

    this.logAction('CREATE_MOVEMENT', `Mouvement ${newMov.type} (${newMov.reference}) créé pour ${newMov.partyName}`);
    return newMov;
  }

  validateMovement(movementId: string): void {
    const movements = this.getMovements();
    const index = movements.findIndex(m => m.id === movementId);
    if (index !== -1 && movements[index].status !== 'VALIDATED') {
      movements[index].status = 'VALIDATED';
      this.setItem(KEYS.MOVEMENTS, movements);
      this.applyMovementToStock(movements[index]);
      this.logAction('VALIDATE_MOVEMENT', `Mouvement ${movements[index].reference} validé.`);
    }
  }

  private applyMovementToStock(mov: StockMovement): void {
    const products = this.getProducts();

    mov.items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.productId);
      if (prodIndex === -1) return;

      const product = products[prodIndex];

      if (mov.type === 'ENTREE_BR') {
        // Increment stock
        if (product.trackingType === 'QUANTITY_SKU') {
          product.currentStockQuantity += item.quantity;
        } else if (product.trackingType === 'SERIAL_NUMBER' && item.serialNumbers) {
          item.serialNumbers.forEach(sn => {
            const existing = this.getSerialBySN(sn);
            if (!existing) {
              this.addSerial({
                productId: product.id,
                serialNumber: sn,
                status: 'IN_STOCK',
                entryDate: mov.date,
                supplierName: mov.partyName,
                entryDeliveryNoteRef: mov.reference,
                warrantyMonths: product.warrantyMonths || 24
              });
            } else {
              this.updateSerialStatus(existing.id, 'IN_STOCK');
            }
          });
        } else if (product.trackingType === 'BATCH_LOT' && item.lotNumber) {
          this.addLot({
            productId: product.id,
            lotNumber: item.lotNumber,
            quantity: item.quantity,
            entryDate: mov.date,
            supplierName: mov.partyName
          });
        }
      } else if (mov.type === 'SORTIE_BL') {
        // Decrement stock
        if (product.trackingType === 'QUANTITY_SKU') {
          product.currentStockQuantity = Math.max(0, product.currentStockQuantity - item.quantity);
        } else if (product.trackingType === 'SERIAL_NUMBER' && item.serialNumbers) {
          item.serialNumbers.forEach(sn => {
            const existing = this.getSerialBySN(sn);
            if (existing) {
              this.updateSerialStatus(existing.id, 'SOLD', mov.partyName, mov.reference);
            }
          });
        } else if (product.trackingType === 'BATCH_LOT' && item.lotNumber) {
          const lots = this.getLotsByProductId(product.id);
          const lotIndex = lots.findIndex(l => l.lotNumber === item.lotNumber);
          if (lotIndex !== -1) {
            lots[lotIndex].quantity = Math.max(0, lots[lotIndex].quantity - item.quantity);
            this.setItem(KEYS.LOTS, lots);
            this.recalculateProductStock(product.id);
          }
        }
      }
    });

    this.setItem(KEYS.PRODUCTS, products);
  }

  // --- AUDITS & RECONCILIATION ---
  getAudits(): InventoryAudit[] {
    return this.getItem<InventoryAudit[]>(KEYS.AUDITS, INITIAL_AUDITS);
  }

  saveAudit(audit: Partial<InventoryAudit> & { title: string }): InventoryAudit {
    const audits = this.getAudits();
    const now = new Date().toISOString();

    if (audit.id) {
      const index = audits.findIndex(a => a.id === audit.id);
      if (index !== -1) {
        const updated = { ...audits[index], ...audit };
        audits[index] = updated;
        this.setItem(KEYS.AUDITS, audits);
        return updated;
      }
    }

    const newAudit: InventoryAudit = {
      id: `inv-${Date.now()}`,
      reference: `INV-2026-${String(audits.length + 1).padStart(3, '0')}`,
      title: audit.title,
      date: audit.date || now.split('T')[0],
      categoryFilter: audit.categoryFilter || 'ALL',
      status: 'IN_PROGRESS',
      items: audit.items || [],
      auditorName: audit.auditorName || 'Magasinier',
      createdAt: now
    };

    audits.unshift(newAudit);
    this.setItem(KEYS.AUDITS, audits);
    this.logAction('CREATE_AUDIT', `Inventaire créé: ${newAudit.reference} - ${newAudit.title}`);
    return newAudit;
  }

  completeAudit(auditId: string): void {
    const audits = this.getAudits();
    const index = audits.findIndex(a => a.id === auditId);
    if (index === -1) return;

    const audit = audits[index];
    audit.status = 'COMPLETED';
    audit.completedAt = new Date().toISOString();

    // Adjust physical stock for all audited items
    const products = this.getProducts();
    audit.items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.productId);
      if (prodIndex !== -1) {
        products[prodIndex].currentStockQuantity = item.physicalStock;
      }
    });

    this.setItem(KEYS.PRODUCTS, products);
    this.setItem(KEYS.AUDITS, audits);
    this.logAction('COMPLETE_AUDIT', `Inventaire ${audit.reference} clôturé. Rapprochement des stocks appliqué.`);
  }

  // --- REORDER SUGGESTIONS (Tableau de bord d'Achat) ---
  getPurchaseSuggestions(): PurchaseSuggestion[] {
    const products = this.getProducts();
    const suggestions: PurchaseSuggestion[] = [];

    products.forEach(p => {
      if (p.currentStockQuantity < p.minStockThreshold) {
        const deficit = p.minStockThreshold - p.currentStockQuantity;
        // Default suggested order is 2x threshold or deficit + standard lot
        const suggested = Math.max(deficit * 2, p.minStockThreshold);
        const estTotal = suggested * p.pricing.purchasePriceHT;

        let supplier = 'Disway Maroc';
        if (p.brand === 'Dell') supplier = 'Dell Morocco SARL';
        else if (p.brand === 'Epson') supplier = 'Epson France Distribution';
        else if (p.brand === 'Clairefontaine') supplier = 'Papeterie du Sud';

        suggestions.push({
          productId: p.id,
          sku: p.sku,
          designation: p.designation,
          brand: p.brand,
          category: p.category,
          currentStock: p.currentStockQuantity,
          reservedStock: p.reservedQuantity,
          minStockThreshold: p.minStockThreshold,
          suggestedReorderQuantity: suggested,
          unitPurchasePriceHT: p.pricing.purchasePriceHT,
          estimatedTotalHT: estTotal,
          preferredSupplier: supplier
        });
      }
    });

    return suggestions;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(KEYS.LOGS, INITIAL_AUDIT_LOGS);
  }

  logAction(action: string, details: string): void {
    const logs = this.getAuditLogs();
    const role = this.getRole();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      timestamp: new Date().toISOString(),
      userRole: role,
      userName: this.getRoleName(role),
      action,
      details
    };
    logs.unshift(newLog);
    // Keep last 100 logs
    this.setItem(KEYS.LOGS, logs.slice(0, 100));
  }

  // --- COMPANY PROFILE & BRANDING ---
  getCompanyProfile(): CompanyProfile {
    return this.getItem<CompanyProfile>(KEYS.COMPANY_PROFILE, INITIAL_COMPANY_PROFILE);
  }

  saveCompanyProfile(profile: CompanyProfile): void {
    this.setItem(KEYS.COMPANY_PROFILE, profile);
    this.logAction('UPDATE_COMPANY_PROFILE', `Informations du fournisseur/société mises à jour: ${profile.name}`);
  }

  // --- PARTNER SUPPLIERS ---
  getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  saveSupplier(supplier: Partial<Supplier> & { name: string }): Supplier {
    const suppliers = this.getSuppliers();
    if (supplier.id) {
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...supplier };
        this.setItem(KEYS.SUPPLIERS, suppliers);
        this.logAction('UPDATE_SUPPLIER', `Fournisseur mis à jour: ${supplier.name}`);
        return suppliers[index];
      }
    }

    const newSupplier: Supplier = {
      id: `supp-${Date.now()}`,
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      ice: supplier.ice || '',
      category: supplier.category || 'General IT',
      paymentTerms: supplier.paymentTerms || '30 Jours',
      rating: supplier.rating || 5,
      logoUrl: supplier.logoUrl || '',
      notes: supplier.notes || ''
    };

    suppliers.push(newSupplier);
    this.setItem(KEYS.SUPPLIERS, suppliers);
    this.logAction('CREATE_SUPPLIER', `Nouveau fournisseur créé: ${newSupplier.name}`);
    return newSupplier;
  }

  deleteSupplier(id: string): void {
    const suppliers = this.getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    this.setItem(KEYS.SUPPLIERS, filtered);
    this.logAction('DELETE_SUPPLIER', `Fournisseur supprimé ID: ${id}`);
  }

  // --- WAREHOUSES & MULTI-LOCATIONS ---
  getWarehouses(): Warehouse[] {
    return this.getItem<Warehouse[]>(KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
  }

  getWarehouseById(id: string): Warehouse | undefined {
    return this.getWarehouses().find(w => w.id === id);
  }

  getDefaultWarehouse(): Warehouse | undefined {
    const list = this.getWarehouses();
    return list.find(w => w.isDefault && w.isActive) || list.find(w => w.isActive) || list[0];
  }

  saveWarehouse(warehouse: Partial<Warehouse> & { name: string }): Warehouse {
    const warehouses = this.getWarehouses();
    const cleanName = warehouse.name.trim();

    // If marked as default, unset previous default
    if (warehouse.isDefault) {
      warehouses.forEach(w => {
        w.isDefault = false;
      });
    }

    if (warehouse.id) {
      const index = warehouses.findIndex(w => w.id === warehouse.id);
      if (index !== -1) {
        warehouses[index] = {
          ...warehouses[index],
          ...warehouse,
          name: cleanName
        };
        this.setItem(KEYS.WAREHOUSES, warehouses);
        this.logAction('UPDATE_WAREHOUSE', `Dépôt / Entrepôt mis à jour: ${cleanName} (${warehouses[index].code})`);
        return warehouses[index];
      }
    }

    // New Warehouse
    const newId = `wh-${Date.now()}`;
    const code = warehouse.code?.trim() || `DEP-${cleanName.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newWh: Warehouse = {
      id: newId,
      name: cleanName,
      code: code.toUpperCase(),
      type: warehouse.type || 'SECONDAIRE',
      city: warehouse.city?.trim() || 'Casablanca',
      address: warehouse.address?.trim() || '',
      managerName: warehouse.managerName?.trim() || '',
      phone: warehouse.phone?.trim() || '',
      email: warehouse.email?.trim() || '',
      capacityNotes: warehouse.capacityNotes?.trim() || '',
      isDefault: !!warehouse.isDefault || warehouses.length === 0,
      isActive: warehouse.isActive !== undefined ? warehouse.isActive : true,
      description: warehouse.description?.trim() || '',
      createdAt: new Date().toISOString()
    };

    warehouses.push(newWh);
    this.setItem(KEYS.WAREHOUSES, warehouses);
    this.logAction('CREATE_WAREHOUSE', `Nouveau dépôt créé: ${newWh.name} [Code: ${newWh.code}]`);
    return newWh;
  }

  deleteWarehouse(id: string): { success: boolean; message?: string } {
    const warehouses = this.getWarehouses();
    const target = warehouses.find(w => w.id === id);
    if (!target) return { success: false, message: 'Dépôt introuvable.' };

    // Check if any product is currently located in this warehouse
    const products = this.getProducts();
    const productsInWh = products.filter(p => p.location?.warehouse === target.name);
    if (productsInWh.length > 0) {
      return {
        success: false,
        message: `Impossible de supprimer ce dépôt : ${productsInWh.length} article(s) y sont actuellement stockés ou assignés. Veuillez d'abord réaffecter ces articles.`
      };
    }

    const filtered = warehouses.filter(w => w.id !== id);
    
    // If we deleted the default warehouse, make the first active warehouse the default
    if (target.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    this.setItem(KEYS.WAREHOUSES, filtered);
    this.logAction('DELETE_WAREHOUSE', `Dépôt supprimé: ${target.name} (${target.code})`);
    return { success: true };
  }

  setDefaultWarehouse(id: string): void {
    const warehouses = this.getWarehouses();
    warehouses.forEach(w => {
      w.isDefault = (w.id === id);
    });
    this.setItem(KEYS.WAREHOUSES, warehouses);
    const selected = warehouses.find(w => w.id === id);
    if (selected) {
      this.logAction('SET_DEFAULT_WAREHOUSE', `Dépôt principal par défaut défini: ${selected.name}`);
    }
  }

  getRoleName(role: UserRole): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur Système';
      case 'PURCHASE_MGR': return 'Responsable Achats';
      case 'WAREHOUSE_AGENT': return 'Agent Magasinier';
      case 'SALES': return 'Vendeur / Commercial';
    }
  }

  // Reset to initial demo data
  resetToDefaults(): void {
    this.setItem(KEYS.ROLE, 'ADMIN');
    this.setItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(KEYS.SERIALS, INITIAL_SERIALS);
    this.setItem(KEYS.LOTS, INITIAL_LOTS);
    this.setItem(KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
    this.setItem(KEYS.AUDITS, INITIAL_AUDITS);
    this.setItem(KEYS.LOGS, INITIAL_AUDIT_LOGS);
    this.setItem(KEYS.COMPANY_PROFILE, INITIAL_COMPANY_PROFILE);
    this.setItem(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    this.setItem(KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
    this.logAction('RESET', 'Base de données réinitialisée aux données d\'origine.');
  }

  exportJSON(): string {
    return JSON.stringify({
      companyProfile: this.getCompanyProfile(),
      suppliers: this.getSuppliers(),
      warehouses: this.getWarehouses(),
      products: this.getProducts(),
      serials: this.getSerials(),
      lots: this.getLots(),
      movements: this.getMovements(),
      audits: this.getAudits(),
      logs: this.getAuditLogs()
    }, null, 2);
  }

  importJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.companyProfile) this.setItem(KEYS.COMPANY_PROFILE, data.companyProfile);
      if (data.suppliers) this.setItem(KEYS.SUPPLIERS, data.suppliers);
      if (data.warehouses) this.setItem(KEYS.WAREHOUSES, data.warehouses);
      if (data.products) this.setItem(KEYS.PRODUCTS, data.products);
      if (data.serials) this.setItem(KEYS.SERIALS, data.serials);
      if (data.lots) this.setItem(KEYS.LOTS, data.lots);
      if (data.movements) this.setItem(KEYS.MOVEMENTS, data.movements);
      if (data.audits) this.setItem(KEYS.AUDITS, data.audits);
      if (data.logs) this.setItem(KEYS.LOGS, data.logs);
      this.logAction('IMPORT_JSON', 'Données importées depuis un fichier JSON externe.');
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }
}

export const storageService = new StorageService();
