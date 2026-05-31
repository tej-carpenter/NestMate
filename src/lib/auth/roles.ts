import type { UserRole } from "@/lib/database/schema";

export const appRoles = ["user", "owner", "admin"] as const satisfies readonly UserRole[];

const legacyRoleMap: Record<string, UserRole> = {
  guest: "user",
  host: "owner",
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

export function isOwnerRole(role: UserRole) {
  return role === "owner";
}