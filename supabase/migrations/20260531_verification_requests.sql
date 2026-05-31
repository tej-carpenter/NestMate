create type verification_subject_type as enum ('user', 'listing');
create type verification_level as enum ('contact', 'owner', 'property', 'photos');
create type verification_status as enum ('draft', 'pending_review', 'needs_action', 'approved', 'rejected', 'revoked');
create type verification_approval_mode as enum ('system', 'admin');

create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  subject_type verification_subject_type not null,
  subject_id uuid not null,
  subject_label text,
  level verification_level not null,
  status verification_status not null default 'draft',
  approval_mode verification_approval_mode not null,
  checklist jsonb not null default '[]'::jsonb,
  evidence_summary text[] not null default '{}'::text[],
  requester_user_id uuid,
  requester_phone text,
  reviewer_user_id uuid,
  reviewer_phone text,
  review_note text,
  requested_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint verification_requests_subject_level_unique unique (subject_type, subject_id, level, status)
);

create index if not exists verification_requests_subject_idx on verification_requests (subject_type, subject_id, level, status, updated_at desc);
create index if not exists verification_requests_status_idx on verification_requests (status, updated_at desc);