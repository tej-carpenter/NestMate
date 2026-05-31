import type { UserRole } from "@/lib/database/schema";
import { isAdminRole, isOwnerRole, normalizeRole } from "@/lib/auth/roles";

export type AppAccessRole = UserRole;

export interface LocalAuthSession {
  userId: string;
  phone: string;
  name: string;
  email?: string | null;
  authMethod?: "phone" | "email";
  role: AppAccessRole;
  signedInAt: number;
}

const sessionStorageKey = "nestmate-session";

export function getPostLoginRoute(role: AppAccessRole) {
  if (isAdminRole(role)) {
    return "/admin/dashboard";
  }

  if (isOwnerRole(role)) {
    return "/host/dashboard";
  }

  return "/profile";
}

export function getAccountLabel(role: AppAccessRole) {
  if (isAdminRole(role)) {
    return "Admin";
  }

  if (isOwnerRole(role)) {
    return "Owner";
  }

  return "Profile";
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
    const parsed = JSON.parse(rawSession) as Partial<LocalAuthSession> | null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const role = normalizeRole(typeof parsed.role === "string" ? parsed.role : null);

    if (!role || typeof parsed.userId !== "string" || typeof parsed.phone !== "string" || typeof parsed.name !== "string" || typeof parsed.signedInAt !== "number") {
      return null;
    }

    return {
      userId: parsed.userId,
      phone: parsed.phone,
      name: parsed.name,
      email: typeof parsed.email === "string" ? parsed.email : null,
      authMethod: parsed.authMethod === "email" ? "email" : "phone",
      role,
      signedInAt: parsed.signedInAt,
    };
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