/**
 * Types & Data Models for IT Stock & Inventory Management
 */

export interface CompanyProfile {
  name: string;             // Nom de la Société / Grossiste / Fournisseur ex: "DISTRIBUTION & MATÉRIEL IT MAROC"
  tagline: string;          // Slogan / Spécialité ex: "Grossiste, Importateur & Soluions Informatiques"
  logoUrl: string;          // Image/Logo en Base64 ou URL
  address: string;          // Adresse Siège Social
  city: string;             // Ville ex: "Casablanca"
  postalCode: string;       // Code Postal ex: "20000"
  country: string;          // Pays ex: "Maroc"
  phone: string;            // Téléphone Fixe
  mobile: string;           // GSM / Support WhatsApp
  email: string;            // Email de contact / Commandes
  website: string;          // Site Web
  ice: string;              // Identifiant Commun de l'Entreprise (ICE)
  ifNumber: string;         // Identifiant Fiscal (IF)
  rcNumber: string;         // Registre du Commerce (RC)
  patente: string;          // Numéro de Patente
  capital: string;          // Capital Social ex: "1.000.000 DH"
  bankDetails: string;      // RIB / Banque pour règlements
  documentFooterNote: string; // Note légale en bas des BR/BL
}

export interface Supplier {
  id: string;
  name: string;             // Nom du Fournisseur
  contactPerson: string;    // Nom de l'interlocuteur
  phone: string;            // Téléphone
  email: string;            // Email
  address: string;          // Adresse
  ice: string;              // ICE
  category: string;         // Catégorie de matériel fourni
  paymentTerms: string;     // Conditions de règlement ex: "30 Jours Fin de Mois"
  rating: number;           // Note de satisfaction 1-5
  logoUrl?: string;         // Logo ou Avatar du Fournisseur
  notes?: string;           // Remarques ou contrats
}

export type UserRole = 'ADMIN' | 'PURCHASE_MGR' | 'WAREHOUSE_AGENT' | 'SALES';

export interface UserPermissions {
  consultStock: boolean;
  inOutMovements: 'ALL' | 'READ_ONLY' | 'NONE';
  validateInventory: 'FULL' | 'INPUT_ONLY' | 'NONE';
  priceAndPurchaseAccess: 'FULL' | 'SELLING_PRICE_ONLY' | 'NONE';
  systemAdmin: boolean;
}

export type ProductCategory = 
  | 'Matériel Identifiable' 
  | 'Consommables & Fournitures' 
  | 'Accessoires & Connectique';

export type TrackingType = 'SERIAL_NUMBER' | 'BATCH_LOT' | 'QUANTITY_SKU';

export interface ProductLocation {
  warehouse: string; // e.g. "Dépôt Principal - Casablanca"
  aisle: string;     // e.g. "Allée B"
  shelf: string;     // e.g. "Étagère 3"
}

export interface ProductPricing {
  purchasePriceHT: number;    // PUMP - Prix Unitaire Moyen Pondéré (DH)
  publicSellingPriceHT: number; // Prix Vente HT (DH)
  publicSellingPriceTTC: number; // Prix Vente TTC (DH)
  resellerPriceHT: number;    // Prix Revendeur / Grossiste (DH)
}

export interface Product {
  id: string;
  sku: string;               // Reference Unique ex: LAP-DELL-5530
  designation: string;       // ex: PC Portable Dell Latitude 5530 i7 16GB
  brand: string;             // ex: Dell, HP, Epson, Cisco
  model: string;             // ex: Latitude 5530
  category: ProductCategory;
  subcategory: string;       // ex: PC Portables, Toners Laser, Câblage
  barcode: string;           // EAN-13 or Code 128
  location: ProductLocation;
  pricing: ProductPricing;
  minStockThreshold: number; // Seuil minimum d'alerte
  currentStockQuantity: number;
  reservedQuantity: number;
  inTransitQuantity: number;
  trackingType: TrackingType;
  warrantyMonths?: number;   // 12, 24, 36 mois
  unit: string;              // Unité, Carton, Ramette, Boîte
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SerialStatus = 'IN_STOCK' | 'RESERVED' | 'SOLD' | 'SAV' | 'RETURNED';

export interface SerialItem {
  id: string;
  productId: string;
  serialNumber: string;       // S/N Unique ex: SN-DELL-884210
  status: SerialStatus;
  entryDate: string;
  supplierName: string;
  entryDeliveryNoteRef: string; // Bon de Réception (BR)
  buyerClientName?: string;
  saleDate?: string;
  exitDeliveryNoteRef?: string; // Bon de Livraison (BL)
  warrantyMonths: number;
  warrantyEndDate?: string;
  notes?: string;
}

export interface BatchLotItem {
  id: string;
  productId: string;
  lotNumber: string;           // ex: LOT-2026-T92
  quantity: number;
  expiryDate?: string;
  compatibility?: string;      // ex: HP LaserJet Pro M404, M428
  entryDate: string;
  supplierName: string;
}

export type MovementType = 
  | 'ENTREE_BR' 
  | 'SORTIE_BL' 
  | 'RESERVATION' 
  | 'RETOUR_CLIENT' 
  | 'RETOUR_SAV' 
  | 'AJUSTEMENT_INVENTAIRE';

export interface MovementItem {
  productId: string;
  productSku: string;
  productDesignation: string;
  quantity: number;
  unitPriceHT: number;
  serialNumbers?: string[];
  lotNumber?: string;
}

export interface StockMovement {
  id: string;
  type: MovementType;
  reference: string;          // BR-2026-001 or BL-2026-005
  date: string;
  partyName: string;          // Supplier or Customer Name
  status: 'DRAFT' | 'VALIDATED' | 'CANCELLED';
  items: MovementItem[];
  varianceNotes?: string;     // Ecarts commande / livraison
  createdBy: string;
  createdAt: string;
}

export interface InventoryAuditItem {
  productId: string;
  productSku: string;
  productDesignation: string;
  category: ProductCategory;
  theoreticalStock: number;
  physicalStock: number;
  difference: number;         // Physical - Theoretical
  justification?: string;     // Vol, Casse, Perte, Erreur de Saisie, Autre
  serialNumbersScanned?: string[];
}

export interface InventoryAudit {
  id: string;
  reference: string;          // INV-2026-001
  title: string;              // ex: "Inventaire Tournant Toners HP"
  date: string;
  categoryFilter?: ProductCategory | 'ALL';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  items: InventoryAuditItem[];
  auditorName: string;
  createdAt: string;
  completedAt?: string;
}

export interface PurchaseSuggestion {
  productId: string;
  sku: string;
  designation: string;
  brand: string;
  category: ProductCategory;
  currentStock: number;
  reservedStock: number;
  minStockThreshold: number;
  suggestedReorderQuantity: number;
  unitPurchasePriceHT: number;
  estimatedTotalHT: number;
  preferredSupplier: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string;
  details: string;
}
