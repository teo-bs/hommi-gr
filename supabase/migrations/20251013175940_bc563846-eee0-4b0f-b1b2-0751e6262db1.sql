-- Add updated_at column to verifications table
ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE TRIGGER set_verifications_updated_at
BEFORE UPDATE ON public.verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();