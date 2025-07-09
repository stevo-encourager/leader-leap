
-- Create missing profiles for users who don't have them
INSERT INTO public.profiles (id, email, full_name)
VALUES 
  ('ce882ea2-b428-4a9d-95df-295e296f6c11', 'accounting@encourager.co.uk', 'Accounting User'),
  ('81fb956b-0ad1-46ba-aa70-a41834403aff', 'stevethompson223@btinternet.com', 'Steve Thompson'),
  ('ff9a01ca-a160-46dc-a458-29b980fe9a1d', 'gospelgeezer@gmail.com', 'Gospel Geezer'),
  ('14fc45c1-8113-46f3-9fef-1ca18b753d0f', 'steve@chainpace.io', 'Steve Chainpace')
ON CONFLICT (id) DO NOTHING;
