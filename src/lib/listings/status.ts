export const listingStatusValues = ["draft", "pending_review", "approved", "rejected", "expired", "archived"] as const;

export type ListingStatus = (typeof listingStatusValues)[number];

export const listingModerationStates = ["active", "suspended"] as const;

export type ListingModerationState = (typeof listingModerationStates)[number];

const legacyStatusMap: Record<string, ListingStatus> = {
  published: "approved",
  suspended: "archived",
  blacklisted: "archived",
};

export const listingReviewValidityMs = 1000 * 60 * 60 * 24 * 90;

export function normalizeListingStatus(value: string | null | undefined, fallback: ListingStatus = "draft"): ListingStatus {
  if (!value) {
    return fallback;
  }

  if (value in legacyStatusMap) {
    return legacyStatusMap[value];
  }

  return listingStatusValues.includes(value as ListingStatus) ? (value as ListingStatus) : fallback;
}

export function normalizeModerationState(value: string | null | undefined): ListingModerationState {
  return value === "suspended" ? "suspended" : "active";
}

export function isPublicListingStatus(status: ListingStatus, moderationState: ListingModerationState = "active") {
  return status === "approved" && moderationState === "active";
}

export function isExpiredListing(status: ListingStatus) {
  return status === "expired";
}

export function canRenewExpiredListing(status: ListingStatus) {
  return status === "expired";
}

export function getListingStatusLabel(status: ListingStatus, moderationState: ListingModerationState = "active") {
  if (moderationState === "suspended") {
    return "Suspended";
  }

  switch (status) {
    case "draft":
      return "Draft";
    case "pending_review":
      return "Pending review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    case "archived":
      return "Archived";
  }
}

export function getListingApprovalExpiry(approvedAt: number, validityMs = listingReviewValidityMs) {
  return approvedAt + validityMs;
}