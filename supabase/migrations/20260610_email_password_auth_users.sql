alter table if exists public.users
  alter column phone drop not null;

create unique index if not exists users_email_unique_idx
  on public.users (lower(email))
  where email is not null;

update public.users
set role = 'user'
where role::text in ('guest', 'host', 'owner');
