import { verificationLevelDefinitions, verificationLevels, type VerificationApprovalMode, type VerificationLevel, type VerificationRequestStatus, type VerificationSubjectType, getVerificationProgressLabel, getVerificationRequestStatusLabel, getVerificationRequestTone, getVerificationLevelDefinition } from "@/lib/verification/status";

const storageKey = "nestmate.verification-requests.v1";

export interface VerificationChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  completedAt: number | null;
}

export interface VerificationRequestRecord {
  id: string;
  subjectType: VerificationSubjectType;
  subjectId: string;
  subjectLabel: string | null;
  level: VerificationLevel;
  approvalMode: VerificationApprovalMode;
  status: VerificationRequestStatus;
  checklist: VerificationChecklistItem[];
  evidenceSummary: string[];
  requesterUserId: string | null;
  requesterPhone: string | null;
  reviewerUserId: string | null;
  reviewerPhone: string | null;
  reviewNote: string | null;
  requestedAt: number;
  submittedAt: number | null;
  reviewedAt: number | null;
  approvedAt: number | null;
  rejectedAt: number | null;
  updatedAt: number;
}

export interface VerificationLevelSummary {
  level: VerificationLevel;
  title: string;
  description: string;
  badgeLabel: string;
  approvalMode: VerificationApprovalMode;
  subjectType: VerificationSubjectType;
  status: VerificationRequestStatus;
  statusLabel: string;
  tone: ReturnType<typeof getVerificationRequestTone>;
  progressLabel: string;
  completedChecks: number;
  totalChecks: number;
  requestId: string | null;
  checklist: VerificationChecklistItem[];
  evidenceSummary: string[];
  reviewNote: string | null;
  updatedAt: number | null;
  submittedAt: number | null;
  reviewedAt: number | null;
  approvedAt: number | null;
  rejectedAt: number | null;
}

export interface VerificationSubjectSummary {
  subjectType: VerificationSubjectType;
  subjectId: string;
  overallStatus: VerificationRequestStatus;
  overallLabel: string;
  levels: Record<VerificationLevel, VerificationLevelSummary>;
}

export interface VerificationRequestInput {
  subjectType: VerificationSubjectType;
  subjectId: string;
  level: VerificationLevel;
  subjectLabel?: string | null;
  requesterUserId?: string | null;
  requesterPhone?: string | null;
  evidenceSummary?: string[];
  checklist?: Partial<Record<string, boolean>>;
}

export interface VerificationDecisionInput {
  requestId: string;
  reviewerUserId?: string | null;
  reviewerPhone?: string | null;
  note?: string | null;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function readList<T>(key: string, fallback: T[]) {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeList<T>(key: string, value: T[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function buildChecklist(level: VerificationLevel, checklist?: Partial<Record<string, boolean>>) {
  return getVerificationLevelDefinition(level).checklist.map((item) => ({
    key: item.key,
    label: item.label,
    completed: checklist?.[item.key] ?? false,
    completedAt: checklist?.[item.key] ? Date.now() : null,
  }));
}

function normalizeChecklist(items: unknown, level: VerificationLevel) {
  const definition = getVerificationLevelDefinition(level);
  const checklist = Array.isArray(items) ? items : [];

  return definition.checklist.map((item) => {
    const matched = checklist.find((entry) => Boolean(entry) && typeof entry === "object" && "key" in entry && (entry as { key?: unknown }).key === item.key) as Partial<VerificationChecklistItem> | undefined;

    return {
      key: item.key,
      label: item.label,
      completed: Boolean(matched?.completed),
      completedAt: typeof matched?.completedAt === "number" ? matched.completedAt : null,
    };
  });
}

function normalizeRecord(record: VerificationRequestRecord): VerificationRequestRecord {
  const definition = getVerificationLevelDefinition(record.level);
  const checklist = normalizeChecklist(record.checklist, record.level);
  const completedChecks = checklist.filter((item) => item.completed).length;
  const totalChecks = checklist.length;
  const autoApproved = definition.approvalMode === "system" && completedChecks === totalChecks;
  const status = autoApproved && record.status !== "rejected" && record.status !== "revoked" ? "approved" : record.status;

  return {
    ...record,
    approvalMode: definition.approvalMode,
    checklist,
    status,
    updatedAt: typeof record.updatedAt === "number" ? record.updatedAt : record.requestedAt,
    evidenceSummary: Array.isArray(record.evidenceSummary) ? record.evidenceSummary.filter((item) => typeof item === "string" && item.trim().length > 0) : [],
    requesterUserId: typeof record.requesterUserId === "string" ? record.requesterUserId : null,
    requesterPhone: typeof record.requesterPhone === "string" ? record.requesterPhone : null,
    reviewerUserId: typeof record.reviewerUserId === "string" ? record.reviewerUserId : null,
    reviewerPhone: typeof record.reviewerPhone === "string" ? record.reviewerPhone : null,
    reviewNote: typeof record.reviewNote === "string" && record.reviewNote.trim().length > 0 ? record.reviewNote : null,
    submittedAt: typeof record.submittedAt === "number" ? record.submittedAt : null,
    reviewedAt: typeof record.reviewedAt === "number" ? record.reviewedAt : null,
    approvedAt: typeof record.approvedAt === "number" ? record.approvedAt : null,
    rejectedAt: typeof record.rejectedAt === "number" ? record.rejectedAt : null,
  };
}

export function getVerificationRequests() {
  const requests = readList<VerificationRequestRecord>(storageKey, []);
  const normalized = requests.map(normalizeRecord);

  if (normalized.some((request, index) => JSON.stringify(request) !== JSON.stringify(requests[index]))) {
    writeList(storageKey, normalized);
  }

  return normalized.sort((left, right) => right.updatedAt - left.updatedAt);
}

export function getVerificationRequestsForSubject(subjectType: VerificationSubjectType, subjectId: string) {
  return getVerificationRequests().filter((request) => request.subjectType === subjectType && request.subjectId === subjectId);
}

export function getLatestVerificationRequest(subjectType: VerificationSubjectType, subjectId: string, level: VerificationLevel) {
  return getVerificationRequestsForSubject(subjectType, subjectId)
    .filter((request) => request.level === level)
    .sort((left, right) => right.updatedAt - left.updatedAt || right.requestedAt - left.requestedAt)[0] ?? null;
}

export function ensureVerificationRequest(input: VerificationRequestInput) {
  const requests = getVerificationRequests();
  const existing = requests.find((request) => request.subjectType === input.subjectType && request.subjectId === input.subjectId && request.level === input.level && request.status !== "rejected" && request.status !== "revoked");

  if (existing) {
    const nextChecklist = input.checklist ? buildChecklist(input.level, input.checklist) : existing.checklist;
    const nextRecord: VerificationRequestRecord = {
      ...existing,
      subjectLabel: input.subjectLabel ?? existing.subjectLabel,
      requesterUserId: input.requesterUserId ?? existing.requesterUserId,
      requesterPhone: input.requesterPhone ?? existing.requesterPhone,
      evidenceSummary: input.evidenceSummary ?? existing.evidenceSummary,
      checklist: nextChecklist,
      updatedAt: Date.now(),
    };

    const next = requests.map((request) => (request.id === existing.id ? normalizeRecord(nextRecord) : request));
    writeList(storageKey, next);
    return next.find((request) => request.id === existing.id) ?? normalizeRecord(nextRecord);
  }

  const now = Date.now();
  const definition = getVerificationLevelDefinition(input.level);
  const record: VerificationRequestRecord = normalizeRecord({
    id: makeId("ver"),
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    subjectLabel: input.subjectLabel ?? null,
    level: input.level,
    approvalMode: definition.approvalMode,
    status: "draft",
    checklist: buildChecklist(input.level, input.checklist),
    evidenceSummary: input.evidenceSummary ?? [],
    requesterUserId: input.requesterUserId ?? null,
    requesterPhone: input.requesterPhone ?? null,
    reviewerUserId: null,
    reviewerPhone: null,
    reviewNote: null,
    requestedAt: now,
    submittedAt: null,
    reviewedAt: null,
    approvedAt: null,
    rejectedAt: null,
    updatedAt: now,
  });

  writeList(storageKey, [record, ...requests]);
  return record;
}

export function submitVerificationRequest(requestId: string) {
  const requests = getVerificationRequests();
  const request = requests.find((entry) => entry.id === requestId);

  if (!request) {
    throw new Error("Verification request not found.");
  }

  const now = Date.now();
  const nextStatus: VerificationRequestStatus = request.approvalMode === "system" && request.checklist.every((item) => item.completed) ? "approved" : "pending_review";

  const nextRecord: VerificationRequestRecord = {
    ...request,
    status: nextStatus,
    submittedAt: now,
    reviewedAt: nextStatus === "approved" ? now : request.reviewedAt,
    approvedAt: nextStatus === "approved" ? now : request.approvedAt,
    updatedAt: now,
  };

  const next = requests.map((entry) => (entry.id === requestId ? normalizeRecord(nextRecord) : entry));
  writeList(storageKey, next);
  return next.find((entry) => entry.id === requestId) ?? normalizeRecord(nextRecord);
}

export function updateVerificationChecklist(input: { requestId: string; checklistItemKey: string; completed: boolean }) {
  const requests = getVerificationRequests();
  const request = requests.find((entry) => entry.id === input.requestId);

  if (!request) {
    throw new Error("Verification request not found.");
  }

  const now = Date.now();
  const checklist = request.checklist.map((item) =>
    item.key === input.checklistItemKey
      ? {
          ...item,
          completed: input.completed,
          completedAt: input.completed ? now : null,
        }
      : item,
  );

  const autoApproved = request.approvalMode === "system" && checklist.every((item) => item.completed);
  const nextRecord: VerificationRequestRecord = {
    ...request,
    checklist,
    status: autoApproved ? "approved" : request.status,
    submittedAt: autoApproved ? now : request.submittedAt,
    reviewedAt: autoApproved ? now : request.reviewedAt,
    approvedAt: autoApproved ? now : request.approvedAt,
    updatedAt: now,
  };

  const next = requests.map((entry) => (entry.id === input.requestId ? normalizeRecord(nextRecord) : entry));
  writeList(storageKey, next);
  return next.find((entry) => entry.id === input.requestId) ?? normalizeRecord(nextRecord);
}

export function approveVerificationRequest(input: VerificationDecisionInput) {
  const requests = getVerificationRequests();
  const request = requests.find((entry) => entry.id === input.requestId);

  if (!request) {
    throw new Error("Verification request not found.");
  }

  const now = Date.now();
  const nextRecord: VerificationRequestRecord = {
    ...request,
    status: "approved",
    reviewerUserId: input.reviewerUserId ?? request.reviewerUserId,
    reviewerPhone: input.reviewerPhone ?? request.reviewerPhone,
    reviewNote: input.note ?? request.reviewNote,
    reviewedAt: now,
    approvedAt: now,
    rejectedAt: null,
    submittedAt: request.submittedAt ?? now,
    updatedAt: now,
  };

  const next = requests.map((entry) => (entry.id === input.requestId ? normalizeRecord(nextRecord) : entry));
  writeList(storageKey, next);
  return next.find((entry) => entry.id === input.requestId) ?? normalizeRecord(nextRecord);
}

export function rejectVerificationRequest(input: VerificationDecisionInput) {
  const requests = getVerificationRequests();
  const request = requests.find((entry) => entry.id === input.requestId);

  if (!request) {
    throw new Error("Verification request not found.");
  }

  const now = Date.now();
  const nextRecord: VerificationRequestRecord = {
    ...request,
    status: "rejected",
    reviewerUserId: input.reviewerUserId ?? request.reviewerUserId,
    reviewerPhone: input.reviewerPhone ?? request.reviewerPhone,
    reviewNote: input.note ?? request.reviewNote,
    reviewedAt: now,
    rejectedAt: now,
    approvedAt: null,
    updatedAt: now,
  };

  const next = requests.map((entry) => (entry.id === input.requestId ? normalizeRecord(nextRecord) : entry));
  writeList(storageKey, next);
  return next.find((entry) => entry.id === input.requestId) ?? normalizeRecord(nextRecord);
}

export function getPendingVerificationRequests() {
  return getVerificationRequests().filter((request) => request.status === "pending_review" || request.status === "needs_action");
}

export function getVerificationSummary(subjectType: VerificationSubjectType, subjectId: string): VerificationSubjectSummary {
  const summary: VerificationSubjectSummary = {
    subjectType,
    subjectId,
    overallStatus: "draft",
    overallLabel: getVerificationRequestStatusLabel("draft"),
    levels: verificationLevels.reduce((accumulator, level) => {
      const definition = verificationLevelDefinitions[level];
      const request = getLatestVerificationRequest(subjectType, subjectId, level);
      const checklist = request?.checklist ?? buildChecklist(level);
      const completedChecks = checklist.filter((item) => item.completed).length;
      const totalChecks = checklist.length;
      const status = request?.status ?? "draft";

      accumulator[level] = {
        level,
        title: definition.title,
        description: definition.description,
        badgeLabel: definition.badgeLabel,
        approvalMode: definition.approvalMode,
        subjectType: definition.subjectType,
        status,
        statusLabel: getVerificationRequestStatusLabel(status),
        tone: getVerificationRequestTone(status),
        progressLabel: getVerificationProgressLabel(completedChecks, totalChecks),
        completedChecks,
        totalChecks,
        requestId: request?.id ?? null,
        checklist,
        evidenceSummary: request?.evidenceSummary ?? [],
        reviewNote: request?.reviewNote ?? null,
        updatedAt: request?.updatedAt ?? null,
        submittedAt: request?.submittedAt ?? null,
        reviewedAt: request?.reviewedAt ?? null,
        approvedAt: request?.approvedAt ?? null,
        rejectedAt: request?.rejectedAt ?? null,
      };

      return accumulator;
    }, {} as Record<VerificationLevel, VerificationLevelSummary>),
  };

  const levels = verificationLevels.map((level) => summary.levels[level]);

  if (levels.every((level) => level.status === "approved")) {
    summary.overallStatus = "approved";
    summary.overallLabel = getVerificationRequestStatusLabel("approved");
    return summary;
  }

  if (levels.some((level) => level.status === "rejected")) {
    summary.overallStatus = "rejected";
    summary.overallLabel = getVerificationRequestStatusLabel("rejected");
    return summary;
  }

  if (levels.some((level) => level.status === "pending_review" || level.status === "needs_action")) {
    summary.overallStatus = levels.some((level) => level.status === "needs_action") ? "needs_action" : "pending_review";
    summary.overallLabel = getVerificationRequestStatusLabel(summary.overallStatus);
    return summary;
  }

  summary.overallStatus = "draft";
  summary.overallLabel = getVerificationRequestStatusLabel("draft");
  return summary;
}