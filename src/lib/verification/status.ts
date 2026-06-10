export const verificationLevels = ["contact", "owner", "property", "photos"] as const;

export type VerificationLevel = (typeof verificationLevels)[number];

export const verificationRequestStatuses = ["draft", "pending_review", "needs_action", "approved", "rejected", "revoked"] as const;

export type VerificationRequestStatus = (typeof verificationRequestStatuses)[number];

export type VerificationSubjectType = "user" | "listing";

export type VerificationApprovalMode = "system" | "admin";

export interface VerificationChecklistItemDefinition {
  key: string;
  label: string;
}

export interface VerificationLevelDefinition {
  level: VerificationLevel;
  title: string;
  description: string;
  subjectType: VerificationSubjectType;
  approvalMode: VerificationApprovalMode;
  badgeLabel: string;
  checklist: VerificationChecklistItemDefinition[];
}

export const verificationLevelDefinitions: Record<VerificationLevel, VerificationLevelDefinition> = {
  contact: {
    level: "contact",
    title: "Verified Contact",
    description: "Email verification is required before the account is trusted for higher-risk actions.",
    subjectType: "user",
    approvalMode: "system",
    badgeLabel: "Contact",
    checklist: [
      { key: "email_verified", label: "Email verified" },
    ],
  },
  owner: {
    level: "owner",
    title: "Verified Owner",
    description: "The owner submits government ID and waits for admin approval.",
    subjectType: "user",
    approvalMode: "admin",
    badgeLabel: "Owner",
    checklist: [
      { key: "government_id_uploaded", label: "Government ID uploaded" },
      { key: "admin_approved", label: "Admin approved" },
    ],
  },
  property: {
    level: "property",
    title: "Verified Property",
    description: "Admins review the listing details and approve the property record separately from listing publication.",
    subjectType: "listing",
    approvalMode: "admin",
    badgeLabel: "Property",
    checklist: [
      { key: "property_reviewed", label: "Property reviewed" },
      { key: "admin_approved", label: "Admin approved" },
    ],
  },
  photos: {
    level: "photos",
    title: "Verified Photos",
    description: "Photos are reviewed independently so the listing can remain published while visual evidence is checked.",
    subjectType: "listing",
    approvalMode: "admin",
    badgeLabel: "Photos",
    checklist: [
      { key: "photos_reviewed", label: "Photos reviewed" },
      { key: "admin_approved", label: "Admin approved" },
    ],
  },
};

export function getVerificationLevelDefinition(level: VerificationLevel) {
  return verificationLevelDefinitions[level];
}

export function getVerificationRequestStatusLabel(status: VerificationRequestStatus) {
  switch (status) {
    case "draft":
      return "Not started";
    case "pending_review":
      return "Pending review";
    case "needs_action":
      return "Needs action";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "revoked":
      return "Revoked";
  }
}

export function getVerificationRequestTone(status: VerificationRequestStatus) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "pending_review":
    case "needs_action":
      return "warn" as const;
    case "rejected":
    case "revoked":
      return "danger" as const;
    case "draft":
      return "muted" as const;
  }
}

export function getVerificationProgressLabel(completedChecks: number, totalChecks: number) {
  if (totalChecks === 0) {
    return "No checks defined";
  }

  return `${completedChecks}/${totalChecks} checks complete`;
}
