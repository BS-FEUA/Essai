import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

type CachedResponse = { data: unknown; expiresAt: number };

// Cache read-only responses only for the active browser session. Returning to a
// page is then immediate, while mutations still invalidate every cached result.
const responseCache = new Map<string, CachedResponse>();
const inFlightReads = new Map<string, Promise<unknown>>();
const READ_CACHE_TTL = 15_000;
let cacheGeneration = 0;
let lastSessionCheckAt = 0;
let sessionCheckInFlight: Promise<void> | null = null;

export function clearApiCache() {
  cacheGeneration += 1;
  responseCache.clear();
}

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
  | 'notifications'
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

// Silent fetch for session checks — Supabase SSR handles JWT cookies automatically
export async function silentFetch<T = any>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
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
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erreur serveur';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
      throw new Error(msg);
    }
    if (options?.method && options.method !== 'GET') clearApiCache();
    return data as T;
  } catch (error: any) {
    if (error.message !== 'Erreur serveur' && error.message !== 'Non authentifié') {
      toast({ title: 'Erreur', description: error.message || 'Erreur réseau', variant: 'destructive' });
    }
    throw error;
  }
}

export async function cachedApiFetch<T = any>(url: string, ttl = READ_CACHE_TTL): Promise<T> {
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.data as T;

  const pending = inFlightReads.get(url);
  if (pending) return pending as Promise<T>;

  const requestGeneration = cacheGeneration;
  const request = apiFetch<T>(url)
    .then((data) => {
      if (requestGeneration === cacheGeneration) {
        responseCache.set(url, { data, expiresAt: Date.now() + ttl });
      }
      return data;
    })
    .finally(() => inFlightReads.delete(url));

  inFlightReads.set(url, request);
  return request;
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  // Check session — Supabase SSR handles JWT cookies automatically
  checkSession: async () => {
    const current = get();
    if (current.isAuthenticated && Date.now() - lastSessionCheckAt < 60_000) {
      set({ loading: false });
      return;
    }
    if (sessionCheckInFlight) return sessionCheckInFlight;
    if (!current.isAuthenticated) {
      set({ loading: true });
    }

    sessionCheckInFlight = (async () => {
      try {
        const data = await silentFetch<{ member: SessionMember }>('/api/auth');
        if (data?.member) {
          set({ member: data.member, isAuthenticated: true, loading: false });
          lastSessionCheckAt = Date.now();
          silentFetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
            .then(d => d && set({ notifications: d.notifications, unreadCount: d.unreadCount }));
          silentFetch<{ announcements: Announcement[] }>('/api/announcements')
            .then(d => d && set({ announcements: d.announcements }));
        } else {
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
      } finally {
        sessionCheckInFlight = null;
      }
    })();
    return sessionCheckInFlight;
  },

  // Login — Supabase sets JWT cookie automatically via @supabase/ssr
  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await apiFetch<{ success: boolean; member: SessionMember }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
      });
      set({
        member: data.member,
        isAuthenticated: true,
        loading: false,
      });
      lastSessionCheckAt = Date.now();
      toast({ title: 'Bienvenue !', description: `Connexion réussie, ${data.member.firstName}` });

      // Load notifications
      silentFetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
        .then(d => d && set({ notifications: d.notifications, unreadCount: d.unreadCount }));
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion. Veuillez réessayer.',
      };
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

  // Logout — Supabase clears JWT cookie automatically
  logout: async () => {
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
    lastSessionCheckAt = 0;
    clearApiCache();
    toast({ title: 'Déconnexion', description: 'À bientôt !' });
  },
}));
