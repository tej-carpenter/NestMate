create type archived_property_reason as enum ('owner_removed', 'admin_removed', 'policy_violation', 'duplicate_listing', 'expired', 'other');

create table if not exists archived_properties (
  id uuid primary key default gen_random_uuid(),
  original_property_id uuid not null,
  owner_id uuid not null,
  owner_phone text not null,
  owner_name text not null,
  title text not null,
  description text not null,
  location text not null,
  pricing jsonb not null,
  property_type text not null,
  status text not null,
  archived_reason archived_property_reason not null,
  archived_by uuid not null,
  archived_at timestamptz not null default now(),
  original_created_at timestamptz not null,
  restored_by uuid,
  restored_at timestamptz,
  listing_snapshot jsonb not null
);

create index if not exists archived_properties_original_property_idx on archived_properties (original_property_id);
create index if not exists archived_properties_owner_idx on archived_properties (owner_id, archived_at desc);
create index if not exists archived_properties_reason_idx on archived_properties (archived_reason, archived_at desc);
create index if not exists archived_properties_archived_at_idx on archived_properties (archived_at desc);
