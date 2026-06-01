import type { UserRole } from "@/lib/database/schema";

export const appRoles = ["user", "admin"] as const satisfies readonly UserRole[];

const legacyRoleMap: Record<string, UserRole> = {
  guest: "user",
  host: "user",
  owner: "user",
};

export function isRole(value: string): value is UserRole {
  return appRoles.includes(value as UserRole);
}

export function normalizeRole(value: string | null | undefined): UserRole | null {
  if (!value) {
    return null;
  }

  if (value in legacyRoleMap) {
    return legacyRoleMap[value];
  }

  return isRole(value) ? value : null;
}

export function isAdminRole(role: UserRole) {
  return role === "admin";
}

export function isUserRole(role: UserRole) {
  return role === "user";
}