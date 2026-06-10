import type { UserRole } from "@/lib/database/schema";
import { isAdminRole, isUserRole, normalizeRole } from "@/lib/auth/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type AppAccessRole = UserRole;

export interface LocalAuthSession {
  userId: string;
  phone: string;
  name: string;
  email: string;
  role: AppAccessRole;
  signedInAt: number;
}

export type AuthProfileInput = {
  userId: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: AppAccessRole | string | null;
  signedInAt?: number;
};

const profileCacheKey = "nestmate-auth-profile";
const legacySessionStorageKey = "nestmate-session";

export function getPostLoginRoute(role: AppAccessRole) {
  if (isAdminRole(role)) {
    return "/admin/dashboard";
  }

  if (isUserRole(role)) {
    return "/profile";
  }

  return "/profile";
}

export function getAccountLabel(role: AppAccessRole) {
  if (isAdminRole(role)) {
    return "Admin";
  }

  return "User";
}

function normalizeProfile(input: Partial<LocalAuthSession> | null | undefined): LocalAuthSession | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const role = normalizeRole(typeof input.role === "string" ? input.role : null) ?? "user";
  const email = typeof input.email === "string" ? input.email : "";

  if (typeof input.userId !== "string" || !email || typeof input.name !== "string" || typeof input.signedInAt !== "number") {
    return null;
  }

  return {
    userId: input.userId,
    phone: typeof input.phone === "string" ? input.phone : "",
    name: input.name,
    email,
    role,
    signedInAt: input.signedInAt,
  };
}

export function cacheAuthProfile(input: AuthProfileInput) {
  if (typeof window === "undefined") {
    return null;
  }

  const profile = normalizeProfile({
    userId: input.userId,
    email: input.email,
    name: input.name || input.email,
    phone: input.phone ?? "",
    role: normalizeRole(typeof input.role === "string" ? input.role : null) ?? "user",
    signedInAt: input.signedInAt ?? Date.now(),
  });

  if (!profile) {
    return null;
  }

  window.localStorage.setItem(profileCacheKey, JSON.stringify(profile));
  window.localStorage.removeItem(legacySessionStorageKey);
  window.dispatchEvent(new Event("nestmate-auth-change"));
  return profile;
}

export function readLocalSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(profileCacheKey) ?? window.localStorage.getItem(legacySessionStorageKey);

  if (!rawSession) {
    return null;
  }

  try {
    return normalizeProfile(JSON.parse(rawSession) as Partial<LocalAuthSession> | null);
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(profileCacheKey);
  window.localStorage.removeItem(legacySessionStorageKey);
  window.dispatchEvent(new Event("nestmate-auth-change"));
}

export async function signOutSession() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  clearLocalSession();

  if (error) {
    throw new Error(error.message);
  }
}

type UserProfileRecord = {
  id?: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
};

export async function upsertSupabaseUserProfile(input: AuthProfileInput) {
  const supabase = createSupabaseBrowserClient();
  const role = normalizeRole(typeof input.role === "string" ? input.role : null) ?? "user";
  const payload = {
    id: input.userId,
    email: input.email,
    name: input.name || input.email,
    phone: input.phone?.trim() || null,
    role,
  };

  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }

  return cacheAuthProfile({
    userId: payload.id,
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    role: payload.role,
    signedInAt: input.signedInAt,
  });
}

export async function loadSupabaseSessionProfile() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const user = data.session?.user;
  if (!user?.id || !user.email) {
    clearLocalSession();
    return null;
  }

  const profileResponse = await supabase
    .from<UserProfileRecord>("users")
    .select("id,email,name,phone,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResponse.error) {
    throw new Error(profileResponse.error.message);
  }

  const metadata = user.user_metadata ?? {};
  const profile = profileResponse.data;

  if (!profile) {
    return upsertSupabaseUserProfile({
      userId: user.id,
      email: user.email,
      name: typeof metadata.name === "string" ? metadata.name : user.email,
      phone: typeof metadata.phone === "string" ? metadata.phone : "",
      role: normalizeRole(typeof metadata.role === "string" ? metadata.role : null) ?? "user",
    });
  }

  return cacheAuthProfile({
    userId: user.id,
    email: profile?.email ?? user.email,
    name: profile?.name ?? (typeof metadata.name === "string" ? metadata.name : user.email),
    phone: profile?.phone ?? (typeof metadata.phone === "string" ? metadata.phone : ""),
    role: normalizeRole(profile?.role ?? null) ?? "user",
    signedInAt: Date.now(),
  });
}

export function subscribeToSupabaseAuth(callback: (session: LocalAuthSession | null) => void) {
  const supabase = createSupabaseBrowserClient();
  const subscription = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user?.id || !session.user.email) {
      clearLocalSession();
      callback(null);
      return;
    }

    void loadSupabaseSessionProfile()
      .then(callback)
      .catch(() => callback(readLocalSession()));
  });

  return () => subscription.data.subscription.unsubscribe();
}
