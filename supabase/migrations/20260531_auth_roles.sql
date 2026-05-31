-- Migrate legacy guest/host roles to the new user/owner/admin model.
-- Adjust the enum type name below if your production schema uses a different name.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'user_role'
  ) THEN
    ALTER TYPE user_role RENAME VALUE 'guest' TO 'user';
    ALTER TYPE user_role RENAME VALUE 'host' TO 'owner';
  END IF;
END $$;

UPDATE public.users
SET role = 'user'
WHERE role = 'guest';

UPDATE public.users
SET role = 'owner'
WHERE role = 'host';

UPDATE public.login_events
SET role = 'user'
WHERE role = 'guest';

UPDATE public.login_events
SET role = 'owner'
WHERE role = 'host';
