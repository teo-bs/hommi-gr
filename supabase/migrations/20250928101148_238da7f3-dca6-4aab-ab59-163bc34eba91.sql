-- Fix the user profile data
UPDATE profiles 
SET 
  first_name = 'George',  -- Extracted from email gboufis@gmail.com
  last_name = 'Boufis'
WHERE id = '8a7d3576-1843-48f5-90ce-6db1d32de5b0';