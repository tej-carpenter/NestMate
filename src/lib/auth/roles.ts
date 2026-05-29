import type { UserRole } from "@/lib/database/schema";

export const appRoles: UserRole[] = ["guest", "host", "admin"];

export function isRole(value: string): value is UserRole {
  return appRoles.includes(value as UserRole);
}

export function canModerate(role: UserRole) {
  return role === "admin";
}

export function canPublishListings(role: UserRole) {
  return role === "host" || role === "admin";
}