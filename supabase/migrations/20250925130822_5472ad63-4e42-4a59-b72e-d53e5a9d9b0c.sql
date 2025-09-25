-- Add phone verifications for existing users (simple version)
INSERT INTO public.verifications (user_id, kind, status, value, verified_at)
SELECT 
  id as user_id,
  'phone'::verification_kind_enum as kind,
  'verified'::verification_status_enum as status,
  '+306917727364' as value,
  now() as verified_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.verifications v 
  WHERE v.user_id = auth.users.id AND v.kind = 'phone'::verification_kind_enum
)
LIMIT 13;