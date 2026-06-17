-- Create policy acceptances table
CREATE TABLE IF NOT EXISTS public.user_policy_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Index for querying by user and policy
CREATE INDEX IF NOT EXISTS idx_user_policy_acceptances_user_id ON public.user_policy_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_policy_acceptances_policy_type ON public.user_policy_acceptances(policy_type);

-- Enable Row Level Security
ALTER TABLE public.user_policy_acceptances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert their own policy acceptances" 
  ON public.user_policy_acceptances 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own records
CREATE POLICY "Users can view their own policy acceptances" 
  ON public.user_policy_acceptances 
  FOR SELECT 
  USING (auth.uid() = user_id);
