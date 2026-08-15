import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { RoleBadge } from './RoleBadge';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import {
  LayoutDashboard,
  Package,
  Barcode,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  Settings,
  Warehouse,
  Search,
  Zap,
  Building2,
  Truck,
  User,
  LogOut,
  Lock,
  KeyRound,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export type ViewTab = 
  | 'dashboard'
  | 'catalog'
  | 'traceability'
  | 'movements'
  | 'inventory'
  | 'purchasing'
  | 'suppliers'
  | 'settings';

interface HeaderProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  lowStockCount: number;
  onOpenScanner: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLogout?: () => void;
  onLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onRoleChange,
  lowStockCount,
  onOpenScanner,
  searchQuery,
  onSearchChange,
  onLogout,
  onLock
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'catalog', label: 'Catalogue Articles', icon: <Package className="w-4 h-4" /> },
    { id: 'traceability', label: 'Traçabilité S/N', icon: <Barcode className="w-4 h-4" /> },
    { id: 'movements', label: 'Mouvements BR/BL', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventaires', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'purchasing', label: 'Achats & Alertes', icon: <AlertTriangle className="w-4 h-4" />, badge: lowStockCount },
    { id: 'suppliers', label: 'Fournisseurs', icon: <Truck className="w-4 h-4" /> },
    { id: 'settings', label: 'Paramètres & Sécurité', icon: <Settings className="w-4 h-4" /> },
  ];

  const profile = storageService.getCompanyProfile();
  const authUser = authService.getUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Warehouse */}
        <div className="flex items-center gap-3">
          {profile.logoUrl && profile.logoUrl.startsWith('data:image') ? (
            <img
              src={profile.logoUrl}
              alt={profile.name}
              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-700 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-sm text-white shrink-0">
              {profile.name.substring(0, 2).toUpperCase() || 'IT'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-100 max-w-xs sm:max-w-md truncate" title={profile.name}>
                {profile.name}
              </h1>
              <span className="text-[10px] bg-blue-900/80 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-700 shrink-0">
                ICE {profile.ice.substring(0, 8)}...
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                <span>Dépôt Principal — {profile.city}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400 truncate max-w-xs">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span className="truncate">{profile.tagline}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Scan */}
        <div className="flex items-center gap-2 flex-1 max-w-md mx-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par SKU, Désignation, S/N, Code-barres..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
            title="Scanner Douchette USB / Caméra QR"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Scan Douchette</span>
          </button>
        </div>

        {/* Right Section: RBAC Preview + Authenticated User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xl:block">
            <RoleBadge currentRole={currentRole} onRoleChange={onRoleChange} />
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden shrink-0">
                {authUser.avatarUrl ? (
                  <img src={authUser.avatarUrl} alt={authUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  authUser.fullName.substring(0, 1).toUpperCase()
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{authUser.fullName.split(' ')[0]}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">@{authUser.username}</div>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-slate-800">
                  <div className="text-xs font-bold text-white truncate">{authUser.fullName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{authUser.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      {storageService.getRoleName(authUser.role)}
                    </span>
                  </div>
                </div>

                <div className="py-1.5 space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onTabChange('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    <span>Mon Profil & Paramètres</span>
                  </button>

                  {onLock && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLock();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Verrouiller la session</span>
                    </button>
                  )}
                </div>

                {onLogout && (
                  <div className="pt-1.5 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
