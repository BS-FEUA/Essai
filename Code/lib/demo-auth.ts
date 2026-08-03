export type DemoUser = {
  email: string;
  name: string;
  role: "CEO" | "MAST_IN" | "MAST" | "MASTER" | "MIX" | "MIN" | "AMC" | "IGN";
  password?: string;
};

const USERS_KEY = "bs_lokossa_demo_users";
const SESSION_KEY = "bs_lokossa_demo_session";
export const DEMO_ACCOUNTS = [
  { email: "superadmin@bslokossa.demo", password: "SuperAdmin2026!", name: "Super administrateur", role: "CEO" as const },
  { email: "bureau@bslokossa.demo", password: "Bureau2026!", name: "Bureau Syndical", role: "MASTER" as const },
  { email: "etudiant@bslokossa.demo", password: "Etudiant2026!", name: "Étudiant démo", role: "IGN" as const },
];

function readUsers(): DemoUser[] {
  if (typeof window === "undefined") return DEMO_ACCOUNTS;
  const stored = window.localStorage.getItem(USERS_KEY);
  if (!stored) return DEMO_ACCOUNTS;
  try { return JSON.parse(stored) as DemoUser[]; } catch { return DEMO_ACCOUNTS; }
}

function notify() { window.dispatchEvent(new Event("bs-demo-auth-change")); }

export function getDemoSession() {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  return email ? readUsers().find((user) => user.email === email) ?? null : null;
}

export function signInDemo(email: string, password: string) {
  const user = readUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) return { error: "E-mail ou mot de passe démo incorrect." };
  window.localStorage.setItem(SESSION_KEY, user.email);
  notify();
  return { user };
}

export function registerDemo(name: string, email: string, password: string) {
  const users = readUsers();
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return { error: "Un compte utilise déjà cette adresse e-mail." };
  const user: DemoUser = { name, email, password, role: "IGN" };
  window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  window.localStorage.setItem(SESSION_KEY, user.email);
  notify();
  return { user };
}

export function signOutDemo() {
  window.localStorage.removeItem(SESSION_KEY);
  notify();
}
