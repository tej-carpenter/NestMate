export type AppAccessRole = "guest" | "user" | "admin";

export interface LocalAuthSession {
  phone: string;
  name: string;
  role: AppAccessRole;
  signedInAt: number;
}

const sessionStorageKey = "nestmate-session";

export function getPostLoginRoute(role: AppAccessRole) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "user") {
    return "/profile";
  }

  return "/guest/dashboard";
}

export function readLocalSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(sessionStorageKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as LocalAuthSession;
  } catch {
    return null;
  }
}

export function writeLocalSession(session: LocalAuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

export function clearLocalSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(sessionStorageKey);
}