import type { UserRole } from "@/lib/database/schema";

export type AccessPrincipal = {
  id?: string;
  role: UserRole;
} | null | undefined;

export type AccessSession = {
  role: UserRole;
} | null | undefined;

type ListingOwnerLike = {
  ownerId: string;
};

export function isAuthenticatedSession(session: AccessSession): session is { role: UserRole } {
  return Boolean(session);
}

export function canSaveListing(session: AccessSession) {
  return isAuthenticatedSession(session);
}

export function canContactOwner(session: AccessSession) {
  return isAuthenticatedSession(session);
}

export function canCreateListing(session: AccessSession) {
  return Boolean(session);
}

export function canEditListing(actor: AccessPrincipal, listing: ListingOwnerLike) {
  return Boolean(actor && (actor.role === "admin" || actor.id === listing.ownerId));
}

export function canDeleteListing(actor: AccessPrincipal, listing: ListingOwnerLike) {
  return canEditListing(actor, listing);
}

export function canModerateListings(session: AccessSession) {
  return Boolean(session && session.role === "admin");
}
