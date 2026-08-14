import React from 'react';
import { UserRole } from '../types';
import { getRolePermissions, storageService } from '../services/storageService';
import { ShieldCheck, UserCheck, PackageCheck, ShoppingCart } from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const RoleBadge: React.FC<Props> = ({ currentRole, onRoleChange }) => {
  const perms = getRolePermissions(currentRole);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'PURCHASE_MGR': return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case 'WAREHOUSE_AGENT': return <PackageCheck className="w-4 h-4 text-amber-600" />;
      case 'SALES': return <UserCheck className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PURCHASE_MGR': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'WAREHOUSE_AGENT': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SALES': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${getRoleColor(currentRole)} shadow-xs`}>
        {getRoleIcon(currentRole)}
        <span>{storageService.getRoleName(currentRole)}</span>
      </div>

      {onRoleChange && (
        <select
          value={currentRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          title="Changer de rôle (Matrice RBAC)"
        >
          <option value="ADMIN">👑 Administrateur</option>
          <option value="PURCHASE_MGR">🛒 Responsable Achat</option>
          <option value="WAREHOUSE_AGENT">📦 Magasinier / Agent Stock</option>
          <option value="SALES">💼 Vendeur / Commercial</option>
        </select>
      )}
    </div>
  );
};
