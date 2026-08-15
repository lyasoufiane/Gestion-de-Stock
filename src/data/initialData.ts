import { Product, SerialItem, BatchLotItem, StockMovement, InventoryAudit, AuditLog, CompanyProfile, Supplier, Warehouse } from '../types';

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Dépôt Principal - Casablanca',
    code: 'DEP-CASA-01',
    type: 'PRINCIPAL',
    city: 'Casablanca',
    address: 'Zone Industrielle Ain Sebaâ, Allée des Usines',
    managerName: 'Tariq Mansouri (Chef Magasinier)',
    phone: '+212 522 35 12 00',
    email: 'depot.casa@distribution-it.ma',
    capacityNotes: '1 200 m² • 350 Palettes • Racks Haute Densité',
    isDefault: true,
    isActive: true,
    description: 'Dépôt central de stockage, réceptions fournisseurs et préparation des commandes clients.',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'wh-002',
    name: 'Dépôt Palettes - Berrechid',
    code: 'DEP-BER-02',
    type: 'SECONDAIRE',
    city: 'Berrechid',
    address: 'Parc Logistique Industriel, Route de Marrakech',
    managerName: 'Karim Bennani',
    phone: '+212 522 91 44 22',
    email: 'logistique.berrechid@distribution-it.ma',
    capacityNotes: '2 500 m² • 800 Palettes • Stockage Masse Consommables',
    isDefault: false,
    isActive: true,
    description: 'Dépôt de réserve volumineuse pour cartons de papier, consommables et serveurs.',
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'wh-003',
    name: 'Magasin Expo - Rabat',
    code: 'MAG-RAB-01',
    type: 'MAGASIN_EXPO',
    city: 'Rabat',
    address: 'Avenue Fal Ould Oumeir, Agdal, Rabat',
    managerName: 'Sophia Idrissi',
    phone: '+212 537 77 88 99',
    email: 'showroom.rabat@distribution-it.ma',
    capacityNotes: '250 m² • Showroom Présentation & Vente Directe',
    isDefault: false,
    isActive: true,
    description: 'Showroom de démonstration, vente directe aux professionnels et stock tampon régional.',
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'wh-004',
    name: 'Atelier SAV & Retours - Casablanca',
    code: 'SAV-CASA-01',
    type: 'SAV',
    city: 'Casablanca',
    address: '145 Boulevard Zerktouni, Niveau -1',
    managerName: 'Amine Chraibi (Tech Lead SAV)',
    phone: '+212 522 34 56 80',
    email: 'sav@distribution-it.ma',
    capacityNotes: '100 m² • Zone Équipements en Diagnostic / Retour Constructeur',
    isDefault: false,
    isActive: true,
    description: 'Zone dédiée aux réceptions SAV, échanges sous garantie et retours constructeurs.',
    createdAt: '2026-04-10T14:00:00Z'
  }
];

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  name: 'DISTRIBUTION & MATÉRIEL IT MAROC',
  tagline: 'Grossiste, Importateur & Solutions Informatiques Professionnelles',
  logoUrl: '',
  address: '145 Boulevard Zerktouni, Immeuble Al Moustakbal, 3ème Étage',
  city: 'Casablanca',
  postalCode: '20000',
  country: 'Maroc',
  phone: '+212 522 34 56 78',
  mobile: '+212 661 12 34 56',
  email: 'contact@distribution-it.ma',
  website: 'www.distribution-it.ma',
  ice: '001849203000085',
  ifNumber: '40291039',
  rcNumber: 'RC 128490 Casablanca',
  patente: '34918204',
  capital: '1 000 000 DH',
  bankDetails: 'Attijariwafa Bank - RIB: 007 780 0001234567890123 45',
  documentFooterNote: 'Marchandise vendue ou livrée conforme aux spécifications techniques. En cas de litige, le tribunal de commerce de Casablanca est seul compétent.'
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-001',
    name: 'Dell Technologies Maroc',
    contactPerson: 'M. Youssef Alami',
    phone: '+212 522 88 99 00',
    email: 'youssef.alami@dell-maroc.ma',
    address: 'Casanearshore Shore 1, Sidi Maârouf, Casablanca',
    ice: '001552399000012',
    category: 'PC Portables, Serveurs, Écrans',
    paymentTerms: '30 Jours Fin de Mois',
    rating: 5,
    notes: 'Partenaire Certified Gold Dell'
  },
  {
    id: 'supp-002',
    name: 'HP Inc Distribution Maroc',
    contactPerson: 'Mme. Sophia Benjelloun',
    phone: '+212 522 77 44 11',
    email: 's.benjelloun@hp-partner.ma',
    address: 'Boulevard Abdelmoumen, Casablanca',
    ice: '001992011000045',
    category: 'Imprimantes, Toners Laser & PC Pro',
    paymentTerms: '30 Jours',
    rating: 5,
    notes: 'Contrat d\'approvisionnement direct Toners d\'origine'
  },
  {
    id: 'supp-003',
    name: 'Disway Grossiste IT',
    contactPerson: 'M. Tariq Mansouri',
    phone: '+212 522 58 90 00',
    email: 't.mansouri@disway.com',
    address: 'Parc d\'Activité Logistique, Tit Mellil, Casablanca',
    ice: '000012399000099',
    category: 'Réseaux Cisco, Accessoires, Câblage & Onduleurs',
    paymentTerms: '60 Jours',
    rating: 4,
    notes: 'Livraison express en 24h sur Casablanca & Rabat'
  },
  {
    id: 'supp-004',
    name: 'Fournitures Papeterie du Sud',
    contactPerson: 'M. Hassan Berrada',
    phone: '+212 522 33 22 11',
    email: 'h.berrada@papeteriesud.ma',
    address: 'Zone Industrielle Ain Sebaâ, Casablanca',
    ice: '001288301000077',
    category: 'Consommables, Papier A4 & Boîtes',
    paymentTerms: 'Comptant à la livraison',
    rating: 4,
    notes: 'Fournisseur ramettes papier Clairefontaine'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- 1. MATÉRIEL IDENTIFIABLE (S/N + Garantie) ---
  {
    id: 'prod-001',
    sku: 'LAP-DELL-5530',
    designation: 'PC Portable Dell Latitude 5530 i7-1255U 16GB 512GB SSD 15.6" FHD',
    brand: 'Dell',
    model: 'Latitude 5530',
    category: 'Matériel Identifiable',
    subcategory: 'PC Portables',
    barcode: '6111234500018',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée A', shelf: 'Étagère 1' },
    pricing: { purchasePriceHT: 8400, publicSellingPriceHT: 10500, publicSellingPriceTTC: 12600, resellerPriceHT: 9400 },
    minStockThreshold: 5,
    currentStockQuantity: 4,
    reservedQuantity: 1,
    inTransitQuantity: 3,
    trackingType: 'SERIAL_NUMBER',
    warrantyMonths: 36,
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 'prod-002',
    sku: 'LAP-HP-PB450',
    designation: 'PC Portable HP ProBook 450 G9 i5-1235U 8GB 512GB SSD 15.6"',
    brand: 'HP',
    model: 'ProBook 450 G9',
    category: 'Matériel Identifiable',
    subcategory: 'PC Portables',
    barcode: '6111234500025',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée A', shelf: 'Étagère 2' },
    pricing: { purchasePriceHT: 6200, publicSellingPriceHT: 7800, publicSellingPriceTTC: 9360, resellerPriceHT: 7000 },
    minStockThreshold: 4,
    currentStockQuantity: 6,
    reservedQuantity: 0,
    inTransitQuantity: 0,
    trackingType: 'SERIAL_NUMBER',
    warrantyMonths: 24,
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80',
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-08-02T11:00:00Z',
  },
  {
    id: 'prod-003',
    sku: 'MON-DELL-P2422',
    designation: 'Écran Professionnel Dell P2422H 23.8" FHD IPS Pivot HDMI/DP',
    brand: 'Dell',
    model: 'P2422H',
    category: 'Matériel Identifiable',
    subcategory: 'Écrans PC',
    barcode: '6111234500032',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée B', shelf: 'Étagère 1' },
    pricing: { purchasePriceHT: 1650, publicSellingPriceHT: 2100, publicSellingPriceTTC: 2520, resellerPriceHT: 1850 },
    minStockThreshold: 6,
    currentStockQuantity: 8,
    reservedQuantity: 2,
    inTransitQuantity: 5,
    trackingType: 'SERIAL_NUMBER',
    warrantyMonths: 36,
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    createdAt: '2026-07-10T14:00:00Z',
    updatedAt: '2026-08-03T08:15:00Z',
  },
  {
    id: 'prod-004',
    sku: 'PRN-HP-M428FDW',
    designation: 'Imprimante Multifonction Laser Monochrome HP LaserJet Pro M428fdw',
    brand: 'HP',
    model: 'LaserJet Pro M428fdw',
    category: 'Matériel Identifiable',
    subcategory: 'Imprimantes',
    barcode: '6111234500049',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée C', shelf: 'Étagère 1' },
    pricing: { purchasePriceHT: 3900, publicSellingPriceHT: 4800, publicSellingPriceTTC: 5760, resellerPriceHT: 4300 },
    minStockThreshold: 3,
    currentStockQuantity: 2,
    reservedQuantity: 0,
    inTransitQuantity: 4,
    trackingType: 'SERIAL_NUMBER',
    warrantyMonths: 24,
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80',
    createdAt: '2026-07-12T10:00:00Z',
    updatedAt: '2026-08-04T09:00:00Z',
  },
  {
    id: 'prod-005',
    sku: 'SRV-DELL-R450',
    designation: 'Serveur Dell PowerEdge R450 Xeon Silver 4310 32GB RAM 2x960GB SSD PERC H355',
    brand: 'Dell',
    model: 'PowerEdge R450',
    category: 'Matériel Identifiable',
    subcategory: 'Serveurs',
    barcode: '6111234500056',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Zone Serveurs', shelf: 'Rack 01' },
    pricing: { purchasePriceHT: 24500, publicSellingPriceHT: 29800, publicSellingPriceTTC: 35760, resellerPriceHT: 27000 },
    minStockThreshold: 1,
    currentStockQuantity: 1,
    reservedQuantity: 0,
    inTransitQuantity: 1,
    trackingType: 'SERIAL_NUMBER',
    warrantyMonths: 36,
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
    createdAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-07-28T16:00:00Z',
  },

  // --- 2. CONSOMMABLES & FOURNITURES (Lots & Seuils critiques) ---
  {
    id: 'prod-006',
    sku: 'TON-HP-CF259A',
    designation: 'Toner Laser Noir HP 59A (CF259A) pour HP LaserJet Pro M404 / M428 (3 000 p.)',
    brand: 'HP',
    model: '59A CF259A',
    category: 'Consommables & Fournitures',
    subcategory: 'Toners Laser',
    barcode: '6111234500063',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée D', shelf: 'Étagère 2' },
    pricing: { purchasePriceHT: 780, publicSellingPriceHT: 980, publicSellingPriceTTC: 1176, resellerPriceHT: 860 },
    minStockThreshold: 15,
    currentStockQuantity: 8, // En dessous du seuil min!
    reservedQuantity: 2,
    inTransitQuantity: 20,
    trackingType: 'BATCH_LOT',
    unit: 'Cartouche',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    createdAt: '2026-07-02T11:00:00Z',
    updatedAt: '2026-08-04T10:00:00Z',
  },
  {
    id: 'prod-007',
    sku: 'PAP-CLAIR-A4',
    designation: 'Carton de 5 Ramettes Papier A4 80g Clairefontaine Smart Print (5x500 feuilles)',
    brand: 'Clairefontaine',
    model: 'Smart Print A4',
    category: 'Consommables & Fournitures',
    subcategory: 'Ramettes Papier',
    barcode: '6111234500070',
    location: { warehouse: 'Dépôt Palettes - Berrechid', aisle: 'Zone Papier', shelf: 'Emplacement P-04' },
    pricing: { purchasePriceHT: 165, publicSellingPriceHT: 210, publicSellingPriceTTC: 252, resellerPriceHT: 180 },
    minStockThreshold: 50, // Seuil min du cahier des charges
    currentStockQuantity: 32, // En dessous du seuil min (32 < 50)!
    reservedQuantity: 5,
    inTransitQuantity: 100,
    trackingType: 'BATCH_LOT',
    unit: 'Carton (5 ramettes)',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-08-04T12:00:00Z',
  },
  {
    id: 'prod-008',
    sku: 'INK-EPSON-T03M',
    designation: 'Bouteille d\'encre Noir Epson 103 EcoTank (T03M) - 65ml',
    brand: 'Epson',
    model: 'EcoTank 103',
    category: 'Consommables & Fournitures',
    subcategory: 'Cartouches d\'encre',
    barcode: '6111234500087',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée D', shelf: 'Étagère 3' },
    pricing: { purchasePriceHT: 85, publicSellingPriceHT: 120, publicSellingPriceTTC: 144, resellerPriceHT: 98 },
    minStockThreshold: 20,
    currentStockQuantity: 25,
    reservedQuantity: 0,
    inTransitQuantity: 0,
    trackingType: 'BATCH_LOT',
    unit: 'Flacon',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80',
    createdAt: '2026-07-08T15:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },

  // --- 3. ACCESSOIRES & CONNECTIQUE (SKU Quantitatif Standard) ---
  {
    id: 'prod-009',
    sku: 'CAB-HDMI-3M',
    designation: 'Câble HDMI 2.0 4K High Speed Mâle/Mâle 3 Mètres Tressé InLine',
    brand: 'InLine',
    model: 'HDMI 2.0 3M',
    category: 'Accessoires & Connectique',
    subcategory: 'Câblage & Connectique',
    barcode: '6111234500094',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée E', shelf: 'Étagère 1' },
    pricing: { purchasePriceHT: 28, publicSellingPriceHT: 55, publicSellingPriceTTC: 66, resellerPriceHT: 38 },
    minStockThreshold: 30,
    currentStockQuantity: 18, // Alerte
    reservedQuantity: 0,
    inTransitQuantity: 50,
    trackingType: 'QUANTITY_SKU',
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-08-03T11:00:00Z',
  },
  {
    id: 'prod-010',
    sku: 'PER-LOGI-MK270',
    designation: 'Ensemble Clavier et Souris Sans Fil Logitech MK270 AZERTY Français',
    brand: 'Logitech',
    model: 'MK270',
    category: 'Accessoires & Connectique',
    subcategory: 'Périphériques',
    barcode: '6111234500100',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée E', shelf: 'Étagère 2' },
    pricing: { purchasePriceHT: 190, publicSellingPriceHT: 270, publicSellingPriceTTC: 324, resellerPriceHT: 220 },
    minStockThreshold: 10,
    currentStockQuantity: 14,
    reservedQuantity: 2,
    inTransitQuantity: 0,
    trackingType: 'QUANTITY_SKU',
    unit: 'Pack',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    createdAt: '2026-07-14T09:30:00Z',
    updatedAt: '2026-08-02T14:20:00Z',
  },
  {
    id: 'prod-011',
    sku: 'HUB-ANKER-7IN1',
    designation: 'Hub USB-C 7-en-1 Anker PowerExpand (HDMI 4K, Power Delivery 100W, SD, USB 3.0)',
    brand: 'Anker',
    model: 'PowerExpand 7-in-1',
    category: 'Accessoires & Connectique',
    subcategory: 'Périphériques',
    barcode: '6111234500117',
    location: { warehouse: 'Dépôt Principal - Casablanca', aisle: 'Allée E', shelf: 'Étagère 3' },
    pricing: { purchasePriceHT: 310, publicSellingPriceHT: 450, publicSellingPriceTTC: 540, resellerPriceHT: 370 },
    minStockThreshold: 8,
    currentStockQuantity: 12,
    reservedQuantity: 0,
    inTransitQuantity: 10,
    trackingType: 'QUANTITY_SKU',
    unit: 'Unité',
    imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&q=80',
    createdAt: '2026-07-18T16:00:00Z',
    updatedAt: '2026-08-04T08:00:00Z',
  }
];

export const INITIAL_SERIALS: SerialItem[] = [
  // Dell Latitude 5530 (4 items in stock, 1 sold)
  {
    id: 'sn-001',
    productId: 'prod-001',
    serialNumber: 'SN-DELL-982101',
    status: 'IN_STOCK',
    entryDate: '2026-07-15',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-004',
    warrantyMonths: 36,
    warrantyEndDate: '2029-07-15',
    notes: 'Scanné à la réception dépôt principal'
  },
  {
    id: 'sn-002',
    productId: 'prod-001',
    serialNumber: 'SN-DELL-982102',
    status: 'IN_STOCK',
    entryDate: '2026-07-15',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-004',
    warrantyMonths: 36,
    warrantyEndDate: '2029-07-15'
  },
  {
    id: 'sn-003',
    productId: 'prod-001',
    serialNumber: 'SN-DELL-982103',
    status: 'RESERVED',
    entryDate: '2026-07-15',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-004',
    warrantyMonths: 36,
    warrantyEndDate: '2029-07-15',
    buyerClientName: 'Devis Validé - Banque Populaire',
    notes: 'Réservé sur Devis DEV-2026-881'
  },
  {
    id: 'sn-004',
    productId: 'prod-001',
    serialNumber: 'SN-DELL-982104',
    status: 'IN_STOCK',
    entryDate: '2026-07-15',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-004',
    warrantyMonths: 36,
    warrantyEndDate: '2029-07-15'
  },
  {
    id: 'sn-005',
    productId: 'prod-001',
    serialNumber: 'SN-DELL-911002',
    status: 'SOLD',
    entryDate: '2026-06-01',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-001',
    buyerClientName: 'Groupe OCP SA',
    saleDate: '2026-07-20',
    exitDeliveryNoteRef: 'BL-2026-012',
    warrantyMonths: 36,
    warrantyEndDate: '2029-06-01'
  },

  // HP ProBook 450 G9 (6 items in stock)
  {
    id: 'sn-006',
    productId: 'prod-002',
    serialNumber: 'SN-HP-PB-4411',
    status: 'IN_STOCK',
    entryDate: '2026-07-20',
    supplierName: 'Disway Maroc',
    entryDeliveryNoteRef: 'BR-2026-008',
    warrantyMonths: 24,
    warrantyEndDate: '2028-07-20'
  },
  {
    id: 'sn-007',
    productId: 'prod-002',
    serialNumber: 'SN-HP-PB-4412',
    status: 'IN_STOCK',
    entryDate: '2026-07-20',
    supplierName: 'Disway Maroc',
    entryDeliveryNoteRef: 'BR-2026-008',
    warrantyMonths: 24,
    warrantyEndDate: '2028-07-20'
  },

  // Dell P2422H Monitor (8 items in stock)
  {
    id: 'sn-008',
    productId: 'prod-003',
    serialNumber: 'SN-MON-DL-8821',
    status: 'IN_STOCK',
    entryDate: '2026-07-10',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-003',
    warrantyMonths: 36,
    warrantyEndDate: '2029-07-10'
  },

  // HP Printer M428fdw
  {
    id: 'sn-009',
    productId: 'prod-004',
    serialNumber: 'SN-PRN-HP-7711',
    status: 'IN_STOCK',
    entryDate: '2026-07-18',
    supplierName: 'Disway Maroc',
    entryDeliveryNoteRef: 'BR-2026-006',
    warrantyMonths: 24,
    warrantyEndDate: '2028-07-18'
  },
  {
    id: 'sn-010',
    productId: 'prod-004',
    serialNumber: 'SN-PRN-HP-7712',
    status: 'IN_STOCK',
    entryDate: '2026-07-18',
    supplierName: 'Disway Maroc',
    entryDeliveryNoteRef: 'BR-2026-006',
    warrantyMonths: 24,
    warrantyEndDate: '2028-07-18'
  },

  // Dell PowerEdge R450 Server
  {
    id: 'sn-011',
    productId: 'prod-005',
    serialNumber: 'SN-SRV-R450-0192',
    status: 'IN_STOCK',
    entryDate: '2026-06-25',
    supplierName: 'Dell Morocco SARL',
    entryDeliveryNoteRef: 'BR-2026-002',
    warrantyMonths: 36,
    warrantyEndDate: '2029-06-25',
    notes: 'Serveur de démonstration en zone sécurisée'
  }
];

export const INITIAL_LOTS: BatchLotItem[] = [
  {
    id: 'lot-001',
    productId: 'prod-006',
    lotNumber: 'LOT-2026-CF259A-1',
    quantity: 8,
    compatibility: 'HP LaserJet Pro M404, M428',
    entryDate: '2026-07-10',
    supplierName: 'Disway Maroc'
  },
  {
    id: 'lot-002',
    productId: 'prod-007',
    lotNumber: 'LOT-2026-PAP-A4',
    quantity: 32,
    compatibility: 'Imprimantes & Copieurs A4',
    entryDate: '2026-06-15',
    supplierName: 'Fournitures Papeterie du Sud'
  },
  {
    id: 'lot-003',
    productId: 'prod-008',
    lotNumber: 'LOT-2026-EPS-T03M',
    quantity: 25,
    compatibility: 'Epson EcoTank L3250 / L3251 / L5290',
    entryDate: '2026-07-08',
    supplierName: 'Epson France distribution'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-001',
    type: 'ENTREE_BR',
    reference: 'BR-2026-008',
    date: '2026-07-20',
    partyName: 'Disway Maroc',
    status: 'VALIDATED',
    items: [
      {
        productId: 'prod-002',
        productSku: 'LAP-HP-PB450',
        productDesignation: 'PC Portable HP ProBook 450 G9 i5-1235U 8GB',
        quantity: 6,
        unitPriceHT: 6200,
        serialNumbers: ['SN-HP-PB-4411', 'SN-HP-PB-4412']
      }
    ],
    createdBy: 'Magasinier Dépôt',
    createdAt: '2026-07-20T10:00:00Z'
  },
  {
    id: 'mov-002',
    type: 'SORTIE_BL',
    reference: 'BL-2026-012',
    date: '2026-07-20',
    partyName: 'Groupe OCP SA',
    status: 'VALIDATED',
    items: [
      {
        productId: 'prod-001',
        productSku: 'LAP-DELL-5530',
        productDesignation: 'PC Portable Dell Latitude 5530 i7-1255U',
        quantity: 1,
        unitPriceHT: 10500,
        serialNumbers: ['SN-DELL-911002']
      }
    ],
    createdBy: 'Vendeur Commercial',
    createdAt: '2026-07-20T14:30:00Z'
  },
  {
    id: 'mov-003',
    type: 'ENTREE_BR',
    reference: 'BR-2026-009',
    date: '2026-08-01',
    partyName: 'Fournitures Papeterie du Sud',
    status: 'VALIDATED',
    items: [
      {
        productId: 'prod-007',
        productSku: 'PAP-CLAIR-A4',
        productDesignation: 'Carton de 5 Ramettes Papier A4 80g Clairefontaine',
        quantity: 20,
        unitPriceHT: 165,
        lotNumber: 'LOT-2026-PAP-A4'
      }
    ],
    varianceNotes: 'Livraison complète sans réserve',
    createdBy: 'Agent Logistique',
    createdAt: '2026-08-01T11:15:00Z'
  }
];

export const INITIAL_AUDITS: InventoryAudit[] = [
  {
    id: 'inv-001',
    reference: 'INV-2026-001',
    title: 'Inventaire Tournant - Toners & Consommables HP',
    date: '2026-08-01',
    categoryFilter: 'Consommables & Fournitures',
    status: 'COMPLETED',
    items: [
      {
        productId: 'prod-006',
        productSku: 'TON-HP-CF259A',
        productDesignation: 'Toner Laser Noir HP 59A (CF259A)',
        category: 'Consommables & Fournitures',
        theoreticalStock: 10,
        physicalStock: 8,
        difference: -2,
        justification: 'Casse lors du manutentionnement en étagère'
      },
      {
        productId: 'prod-008',
        productSku: 'INK-EPSON-T03M',
        productDesignation: 'Bouteille d\'encre Noir Epson 103 EcoTank',
        category: 'Consommables & Fournitures',
        theoreticalStock: 25,
        physicalStock: 25,
        difference: 0
      }
    ],
    auditorName: 'Magasinier Chef',
    createdAt: '2026-08-01T08:00:00Z',
    completedAt: '2026-08-01T11:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-04T09:12:00Z',
    userRole: 'ADMIN',
    userName: 'Administrateur Système',
    action: 'INITIALIZATION',
    details: 'Base de données de stock et inventaire IT initialisée avec succès'
  },
  {
    id: 'log-002',
    timestamp: '2026-08-04T10:05:00Z',
    userRole: 'WAREHOUSE_AGENT',
    userName: 'Agent Magasinier',
    action: 'SCAN_S/N',
    details: 'Vérification séquentielle S/N Dell Latitude 5530 (SN-DELL-982101)'
  }
];
