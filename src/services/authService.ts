import { AuthUser, AuthSession, LoginAttempt, UserRole, UserAccessRights } from '../types';
import { storageService } from './storageService';

const STORAGE_KEYS = {
  USERS_LIST: 'it_stock_auth_users_list',
  SESSION: 'it_stock_auth_session',
  LOGIN_LOGS: 'it_stock_auth_login_logs',
};

export const DEFAULT_ROLE_RIGHTS: Record<UserRole, UserAccessRights> = {
  ADMIN: {
    canConsultStock: true,
    canCreateMovements: true,
    canValidateInventory: true,
    canViewPurchasePrices: true,
    canManageSuppliers: true,
    canManageCatalog: true,
    canManageUsers: true,
    canExportData: true,
  },
  PURCHASE_MGR: {
    canConsultStock: true,
    canCreateMovements: true,
    canValidateInventory: true,
    canViewPurchasePrices: true,
    canManageSuppliers: true,
    canManageCatalog: true,
    canManageUsers: false,
    canExportData: true,
  },
  WAREHOUSE_AGENT: {
    canConsultStock: true,
    canCreateMovements: true,
    canValidateInventory: true,
    canViewPurchasePrices: false,
    canManageSuppliers: false,
    canManageCatalog: true,
    canManageUsers: false,
    canExportData: false,
  },
  SALES: {
    canConsultStock: true,
    canCreateMovements: false,
    canValidateInventory: false,
    canViewPurchasePrices: false,
    canManageSuppliers: false,
    canManageCatalog: false,
    canManageUsers: false,
    canExportData: false,
  },
};

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr-admin-001',
    username: 'admin',
    email: 'soufian144@gmail.com',
    fullName: 'Soufiane (Administrateur)',
    role: 'ADMIN',
    passwordHash: 'admin123',
    pinCode: '2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    accessRights: { ...DEFAULT_ROLE_RIGHTS.ADMIN },
    lastLoginAt: new Date().toISOString(),
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-purchase-002',
    username: 'achat_youssef',
    email: 'achats@distribution-it.ma',
    fullName: 'Youssef El Amrani',
    role: 'PURCHASE_MGR',
    passwordHash: 'achat123',
    pinCode: '1001',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    accessRights: { ...DEFAULT_ROLE_RIGHTS.PURCHASE_MGR },
    createdAt: '2026-01-15T09:30:00.000Z'
  },
  {
    id: 'usr-warehouse-003',
    username: 'magasin_tariq',
    email: 'depot@distribution-it.ma',
    fullName: 'Tariq Benali',
    role: 'WAREHOUSE_AGENT',
    passwordHash: 'stock123',
    pinCode: '2002',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    accessRights: { ...DEFAULT_ROLE_RIGHTS.WAREHOUSE_AGENT },
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'usr-sales-004',
    username: 'commercial_sara',
    email: 'sara.ventes@distribution-it.ma',
    fullName: 'Sara Mansouri',
    role: 'SALES',
    passwordHash: 'vente123',
    pinCode: '3003',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    accessRights: { ...DEFAULT_ROLE_RIGHTS.SALES },
    createdAt: '2026-02-10T14:15:00.000Z'
  }
];

type AuthListener = (session: AuthSession | null) => void;
const authListeners: Set<AuthListener> = new Set();

function notifyAuth(session: AuthSession | null) {
  authListeners.forEach(fn => fn(session));
}

export const subscribeToAuth = (listener: AuthListener) => {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
};

class AuthService {
  // Get list of all registered users
  getUsers(): AuthUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (!data) {
        // Check if legacy single user exists, else seed defaults
        this.saveAllUsers(DEFAULT_USERS);
        return DEFAULT_USERS;
      }
      const users: AuthUser[] = JSON.parse(data);
      if (!Array.isArray(users) || users.length === 0) {
        this.saveAllUsers(DEFAULT_USERS);
        return DEFAULT_USERS;
      }
      // Ensure all users have valid accessRights and isActive
      return users.map(u => ({
        ...u,
        isActive: u.isActive !== false,
        accessRights: u.accessRights || { ...DEFAULT_ROLE_RIGHTS[u.role || 'SALES'] }
      }));
    } catch {
      return DEFAULT_USERS;
    }
  }

  private saveAllUsers(users: AuthUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  }

  getUserById(id: string): AuthUser | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByUsername(username: string): AuthUser | undefined {
    const clean = username.trim().toLowerCase();
    return this.getUsers().find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);
  }

  // Current logged in user (or fallback to admin)
  getUser(): AuthUser {
    const session = this.getSession();
    if (session?.user) {
      // Refresh user from DB to get latest permissions/profile
      const fresh = this.getUserById(session.user.id);
      return fresh || session.user;
    }
    const users = this.getUsers();
    return users.find(u => u.role === 'ADMIN') || users[0] || DEFAULT_USERS[0];
  }

  // Get current active session
  getSession(): AuthSession | null {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
      if (session) return JSON.parse(session);
      return null;
    } catch {
      return null;
    }
  }

  private setSession(session: AuthSession | null, rememberMe: boolean): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      const json = JSON.stringify(session);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.SESSION, json);
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      } else {
        sessionStorage.setItem(STORAGE_KEYS.SESSION, json);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }
    notifyAuth(session);
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    return !!session && !session.isLocked && !!session.user.isActive;
  }

  isSessionLocked(): boolean {
    const session = this.getSession();
    return !!session && !!session.isLocked;
  }

  // Save (Create or Update) User by Admin
  saveUser(
    userData: Partial<AuthUser> & {
      username: string;
      fullName: string;
      role: UserRole;
      email: string;
    }
  ): { success: boolean; message: string; user?: AuthUser } {
    const users = this.getUsers();
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    // Validate unique username and email
    const existingSameUsername = users.find(
      u => u.username.toLowerCase() === cleanUsername && u.id !== userData.id
    );
    if (existingSameUsername) {
      return { success: false, message: `Le nom d'utilisateur "${userData.username}" est déjà utilisé.` };
    }

    const existingSameEmail = users.find(
      u => u.email.toLowerCase() === cleanEmail && u.id !== userData.id
    );
    if (existingSameEmail) {
      return { success: false, message: `L'adresse email "${userData.email}" est déjà attribuée.` };
    }

    const now = new Date().toISOString();
    const defaultRights = DEFAULT_ROLE_RIGHTS[userData.role] || DEFAULT_ROLE_RIGHTS.SALES;
    const finalRights: UserAccessRights = userData.accessRights
      ? { ...userData.accessRights }
      : { ...defaultRights };

    if (userData.id) {
      // Update existing
      const index = users.findIndex(u => u.id === userData.id);
      if (index !== -1) {
        const existing = users[index];
        const updated: AuthUser = {
          ...existing,
          fullName: userData.fullName.trim(),
          username: userData.username.trim(),
          email: userData.email.trim(),
          role: userData.role,
          avatarUrl: userData.avatarUrl || existing.avatarUrl,
          pinCode: userData.pinCode !== undefined ? userData.pinCode : existing.pinCode,
          passwordHash: userData.passwordHash || existing.passwordHash,
          isActive: userData.isActive !== undefined ? userData.isActive : existing.isActive,
          accessRights: finalRights
        };

        users[index] = updated;
        this.saveAllUsers(users);

        // If updating the active session user, update session
        const currentSession = this.getSession();
        if (currentSession && currentSession.user.id === updated.id) {
          this.setSession({ ...currentSession, user: updated }, currentSession.rememberMe);
          storageService.setRole(updated.role);
        }

        storageService.logAction(
          'UPDATE_USER',
          `Utilisateur modifié: ${updated.fullName} (@${updated.username}, Rôle: ${updated.role})`
        );

        return { success: true, message: 'Utilisateur mis à jour avec succès !', user: updated };
      }
    }

    // Create New User
    const newUser: AuthUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: userData.username.trim(),
      email: userData.email.trim(),
      fullName: userData.fullName.trim(),
      role: userData.role,
      passwordHash: userData.passwordHash || 'pass123',
      pinCode: userData.pinCode || undefined,
      avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
      isActive: userData.isActive !== false,
      accessRights: finalRights,
      createdAt: now
    };

    users.push(newUser);
    this.saveAllUsers(users);

    storageService.logAction(
      'CREATE_USER',
      `Nouvel utilisateur créé: ${newUser.fullName} (@${newUser.username}, Rôle: ${newUser.role})`
    );

    return { success: true, message: `Utilisateur @${newUser.username} créé avec succès !`, user: newUser };
  }

  // Delete User with safeguards
  deleteUser(id: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) {
      return { success: false, message: 'Utilisateur introuvable.' };
    }

    const currentSession = this.getSession();
    if (currentSession && currentSession.user.id === id) {
      return { success: false, message: 'Vous ne pouvez pas supprimer votre propre compte actif.' };
    }

    // Ensure at least one admin remains active
    const activeAdmins = users.filter(u => u.role === 'ADMIN' && u.isActive && u.id !== id);
    if (targetUser.role === 'ADMIN' && activeAdmins.length === 0) {
      return { success: false, message: 'Impossible de supprimer le dernier compte administrateur du système.' };
    }

    const filtered = users.filter(u => u.id !== id);
    this.saveAllUsers(filtered);

    storageService.logAction(
      'DELETE_USER',
      `Utilisateur supprimé: ${targetUser.fullName} (@${targetUser.username})`
    );

    return { success: true, message: `Utilisateur @${targetUser.username} supprimé avec succès.` };
  }

  // Toggle user active / suspended status
  toggleUserStatus(id: string): { success: boolean; message: string; user?: AuthUser } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'Utilisateur introuvable.' };

    const target = users[index];
    const currentSession = this.getSession();
    if (currentSession && currentSession.user.id === id && target.isActive) {
      return { success: false, message: 'Vous ne pouvez pas désactiver votre propre session active.' };
    }

    target.isActive = !target.isActive;
    users[index] = target;
    this.saveAllUsers(users);

    storageService.logAction(
      'TOGGLE_USER_STATUS',
      `Statut utilisateur modifié: @${target.username} -> ${target.isActive ? 'ACTIF' : 'SUSPENDU'}`
    );

    return {
      success: true,
      message: `Compte @${target.username} ${target.isActive ? 'activé' : 'suspendu'}.`,
      user: target
    };
  }

  // Update specific access rights
  updateUserRights(id: string, rights: UserAccessRights): { success: boolean; message: string } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'Utilisateur introuvable.' };

    users[index].accessRights = { ...rights };
    this.saveAllUsers(users);

    // Update active session if target is current user
    const currentSession = this.getSession();
    if (currentSession && currentSession.user.id === id) {
      this.setSession({ ...currentSession, user: users[index] }, currentSession.rememberMe);
    }

    storageService.logAction(
      'UPDATE_USER_RIGHTS',
      `Droits d'accès mis à jour pour: @${users[index].username}`
    );

    return { success: true, message: 'Droits d\'accès modifiés avec succès !' };
  }

  // Reset password by admin
  resetUserPassword(id: string, newPass: string): { success: boolean; message: string } {
    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'Utilisateur introuvable.' };

    users[index].passwordHash = newPass;
    this.saveAllUsers(users);

    storageService.logAction(
      'ADMIN_RESET_PASSWORD',
      `Mot de passe réinitialisé pour: @${users[index].username}`
    );

    return { success: true, message: `Nouveau mot de passe enregistré pour @${users[index].username}.` };
  }

  // Login with Username/Email and Password
  loginWithPassword(
    identifier: string,
    passwordAttempt: string,
    rememberMe = true
  ): { success: boolean; message: string; user?: AuthUser } {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();

    const user = users.find(
      u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    const now = new Date().toISOString();

    if (!user) {
      this.logAttempt(identifier, false, 'PASSWORD');
      return {
        success: false,
        message: 'Utilisateur ou email inexistant. Vérifiez vos identifiants.'
      };
    }

    if (!user.isActive) {
      this.logAttempt(identifier, false, 'PASSWORD');
      return {
        success: false,
        message: 'Ce compte utilisateur a été suspendu par l\'administrateur.'
      };
    }

    const isPasswordMatch =
      passwordAttempt === user.passwordHash ||
      (user.passwordHash === 'admin123' && passwordAttempt === 'admin');

    if (!isPasswordMatch) {
      this.logAttempt(identifier, false, 'PASSWORD');
      storageService.logAction(
        'LOGIN_FAIL',
        `Tentative infructueuse pour @${user.username}`
      );
      return {
        success: false,
        message: 'Mot de passe incorrect.'
      };
    }

    // Success
    user.lastLoginAt = now;
    this.saveUser(user);

    const session: AuthSession = {
      user,
      token: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authenticatedAt: now,
      rememberMe,
      isLocked: false
    };

    this.setSession(session, rememberMe);
    storageService.setRole(user.role);
    this.logAttempt(identifier, true, 'PASSWORD');
    storageService.logAction(
      'LOGIN_SUCCESS',
      `Connexion réussie: ${user.fullName} (@${user.username}, ${user.role})`
    );

    return {
      success: true,
      message: 'Connexion réussie',
      user
    };
  }

  // Login with PIN Code
  loginWithPin(
    pinAttempt: string,
    rememberMe = true
  ): { success: boolean; message: string; user?: AuthUser } {
    const users = this.getUsers();
    const cleanPin = pinAttempt.trim();
    const now = new Date().toISOString();

    const user = users.find(u => u.pinCode && u.pinCode.trim() === cleanPin && u.isActive);

    if (!user) {
      this.logAttempt('Code PIN', false, 'PIN');
      return {
        success: false,
        message: 'Code PIN non reconnu ou compte inactif.'
      };
    }

    user.lastLoginAt = now;
    this.saveUser(user);

    const session: AuthSession = {
      user,
      token: `tok-pin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authenticatedAt: now,
      rememberMe,
      isLocked: false
    };

    this.setSession(session, rememberMe);
    storageService.setRole(user.role);
    this.logAttempt(`PIN (@${user.username})`, true, 'PIN');
    storageService.logAction(
      'LOGIN_SUCCESS_PIN',
      `Connexion par Code PIN validée pour @${user.username}`
    );

    return {
      success: true,
      message: `Bienvenue ${user.fullName} !`,
      user
    };
  }

  // Lock session
  lockSession(): void {
    const session = this.getSession();
    if (session) {
      const lockedSession: AuthSession = { ...session, isLocked: true };
      this.setSession(lockedSession, session.rememberMe);
      storageService.logAction('SESSION_LOCKED', `Session verrouillée pour @${session.user.username}`);
    }
  }

  // Unlock session
  unlockSession(credential: string): boolean {
    const session = this.getSession();
    if (!session) return false;

    const user = this.getUserById(session.user.id) || session.user;
    const trimmed = credential.trim();
    const match =
      trimmed === user.passwordHash ||
      (user.passwordHash === 'admin123' && trimmed === 'admin') ||
      (!!user.pinCode && trimmed === user.pinCode);

    if (match) {
      const unlocked: AuthSession = { ...session, isLocked: false };
      this.setSession(unlocked, session.rememberMe);
      storageService.logAction('SESSION_UNLOCKED', `Session déverrouillée (@${user.username})`);
      return true;
    }
    return false;
  }

  // Logout
  logout(): void {
    const user = this.getUser();
    storageService.logAction('LOGOUT', `Déconnexion de l'utilisateur @${user.username}`);
    this.setSession(null, false);
  }

  // Update current user's profile
  updateProfile(updates: {
    fullName: string;
    username: string;
    email: string;
    avatarUrl?: string;
  }): { success: boolean; message: string } {
    const current = this.getUser();
    return this.saveUser({
      ...current,
      ...updates
    });
  }

  // Change current user's password
  changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const user = this.getUser();
    const isCurrentValid =
      currentPassword === user.passwordHash ||
      (user.passwordHash === 'admin123' && currentPassword === 'admin');

    if (!isCurrentValid) {
      return { success: false, message: 'Le mot de passe actuel est incorrect.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' };
    }

    return this.saveUser({
      ...user,
      passwordHash: newPassword
    });
  }

  // Change current user's PIN
  changePin(newPin: string): { success: boolean; message: string } {
    if (newPin && (newPin.length < 4 || !/^\d+$/.test(newPin))) {
      return { success: false, message: 'Le code PIN doit comporter 4 à 6 chiffres.' };
    }
    const user = this.getUser();
    return this.saveUser({
      ...user,
      pinCode: newPin || undefined
    });
  }

  // Check if current user has a specific granular right
  hasPermission(permission: keyof UserAccessRights): boolean {
    const user = this.getUser();
    if (!user.isActive) return false;
    if (user.role === 'ADMIN') return true;
    return !!user.accessRights?.[permission];
  }

  // Connection attempts log
  private logAttempt(identifier: string, success: boolean, method: 'PASSWORD' | 'PIN'): void {
    try {
      const logs = this.getLoginHistory();
      const newLog: LoginAttempt = {
        id: `att-${Date.now()}`,
        timestamp: new Date().toISOString(),
        identifier,
        success,
        method,
        ipAddress: '192.168.1.10 (Local IT Gateway)',
        userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Poste Fixe / Bureau'
      };
      const updatedLogs = [newLog, ...logs.slice(0, 29)];
      localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Error logging login attempt', e);
    }
  }

  getLoginHistory(): LoginAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Reset to default users list
  resetToDefaultUsers(): void {
    this.saveAllUsers(DEFAULT_USERS);
    const admin = DEFAULT_USERS[0];
    this.setSession({
      user: admin,
      token: `tok-${Date.now()}`,
      authenticatedAt: new Date().toISOString(),
      rememberMe: true,
      isLocked: false
    }, true);
    storageService.setRole(admin.role);
    storageService.logAction('RESET_USERS', 'Liste des utilisateurs et droits réinitialisée aux comptes de démo.');
  }
}

export const authService = new AuthService();
