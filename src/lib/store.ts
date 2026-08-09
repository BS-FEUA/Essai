import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

// Types
export interface SessionMember {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  accessLevel: string;
  status: string;
  institution: string | null;
  filiere: string | null;
  niveau: string | null;
  photoUrl: string | null;
}

export type ViewName =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'members'
  | 'member-profile'
  | 'documents'
  | 'cash'
  | 'messages'
  | 'uniforms'
  | 'admin'
  | 'landa';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  isActive: boolean;
  createdAt: string;
}

// Access hierarchy
const ACCESS_HIERARCHY: Record<string, number> = {
  CEO: 7, MAST_IN: 6, MAST: 5, MASTER: 4, MIX: 3, MIN: 2, AMC: 1, IGN: 0,
};

export const ACCESS_LABELS: Record<string, string> = {
  CEO: 'CEO', MAST_IN: 'Mast In', MAST: 'Mast', MASTER: 'Master',
  MIX: 'Mix', MIN: 'Min', AMC: 'AMC', IGN: 'IGN',
};

export function canAccess(userLevel: string, requiredLevel: string): boolean {
  return (ACCESS_HIERARCHY[userLevel] || 0) >= (ACCESS_HIERARCHY[requiredLevel] || 0);
}

// Silent fetch for session checks (no toast on 401)
export async function silentFetch<T = any>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bs-session') : null;
    const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      reqHeaders['x-bs-session'] = token;
    }
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: { ...reqHeaders, ...options?.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data as T;
  } catch { return null; }
}

// API fetch helper
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bs-session') : null;
    const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      reqHeaders['x-bs-session'] = token;
    }
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: { ...reqHeaders, ...options?.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erreur serveur';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
      throw new Error(msg);
    }
    return data as T;
  } catch (error: any) {
    if (error.message !== 'Erreur serveur' && error.message !== 'Non authentifié') {
      toast({ title: 'Erreur', description: error.message || 'Erreur réseau', variant: 'destructive' });
    }
    throw error;
  }
}

// Store interface
interface AppState {
  // Auth
  member: SessionMember | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Navigation
  currentView: ViewName;
  selectedMemberId: string | null;

  // Data
  notifications: Notification[];
  unreadCount: number;
  announcements: Announcement[];

  // Actions
  setMember: (member: SessionMember | null) => void;
  setLoading: (loading: boolean) => void;
  setView: (view: ViewName) => void;
  setSelectedMemberId: (id: string | null) => void;
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  setAnnouncements: (announcements: Announcement[]) => void;

  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Record<string, any>) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  member: null,
  isAuthenticated: false,
  loading: true,
  currentView: 'landing',
  selectedMemberId: null,
  notifications: [],
  unreadCount: 0,
  announcements: [],

  // Setters
  setMember: (member) => set({ member, isAuthenticated: !!member }),
  setLoading: (loading) => set({ loading }),
  setView: (view) => set({ currentView: view }),
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  setAnnouncements: (announcements) => set({ announcements }),

  // Check session
  checkSession: async () => {
    const current = get();
    if (!current.isAuthenticated) {
      set({ loading: true });
    }
    // Pre-populate from localStorage on first render to prevent flickering in iframes
    if (typeof window !== 'undefined') {
      const savedMember = localStorage.getItem('bs-member');
      if (savedMember) {
        try {
          const parsed = JSON.parse(savedMember);
          set({ member: parsed, isAuthenticated: true, loading: false });
        } catch { /* ignore */ }
      }
    }

    try {
      const data = await silentFetch<{ member: SessionMember }>('/api/auth');
      if (data?.member) {
        set({ member: data.member, isAuthenticated: true, loading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('bs-member', JSON.stringify(data.member));
        }
        silentFetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
          .then(d => d && set({ notifications: d.notifications, unreadCount: d.unreadCount }));
        silentFetch<{ announcements: Announcement[] }>('/api/announcements')
          .then(d => d && set({ announcements: d.announcements }));
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bs-session');
          localStorage.removeItem('bs-member');
        }
        if (!current.isAuthenticated) {
          set({ loading: false, member: null, isAuthenticated: false });
        } else {
          set({ loading: false });
        }
        const d = await silentFetch<{ announcements: Announcement[] }>('/api/announcements');
        if (d) set({ announcements: d.announcements });
      }
    } catch {
      set({ loading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await apiFetch<{ success: boolean; member: SessionMember; token?: string }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
      });
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('bs-session', data.token);
        localStorage.setItem('bs-member', JSON.stringify(data.member));
      }
      set({
        member: data.member,
        isAuthenticated: true,
        loading: false,
      });
      toast({ title: 'Bienvenue !', description: `Connexion réussie, ${data.member.firstName}` });

      // Load notifications
      silentFetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
        .then(d => d && set({ notifications: d.notifications, unreadCount: d.unreadCount }));
      return true;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  // Register
  register: async (data) => {
    set({ loading: true });
    try {
      const res = await apiFetch<{ success: boolean; message?: string }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'register', ...data }),
      });
      // Registration is a request for approval, never an authenticated session.
      set({ member: null, isAuthenticated: false, loading: false });
      toast({
        title: 'Inscription réussie !',
        description: res?.message || 'Votre compte attend la validation du super administrateur.',
      });
      return true;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  // Logout
  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bs-session');
      localStorage.removeItem('bs-member');
    }
    try {
      await apiFetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch { /* ignore */ }
    set({
      member: null,
      isAuthenticated: false,
      loading: false,
      notifications: [],
      unreadCount: 0,
      selectedMemberId: null,
    });
    toast({ title: 'Déconnexion', description: 'À bientôt !' });
  },
}));
