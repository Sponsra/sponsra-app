-- 1. Ensure we have a user (If you wiped the DB, use the ID from your Auth tab)
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Authentication -> Users
-- You can find this by copying the User UID from the Auth table.

INSERT INTO public.newsletters (owner_id, name, slug, description)
VALUES 
  ('8a3fbf71-7318-417b-b5a2-4f7c88625567', 'The Frontier', 'frontier', 'Deep dives into space and tech.');

-- 2. Add some products
INSERT INTO public.inventory_tiers (newsletter_id, name, type, price)
SELECT id, 'Main Sponsor', 'sponsor', 50000 
FROM public.newsletters WHERE slug = 'frontier';

INSERT INTO public.inventory_tiers (newsletter_id, name, type, price)
SELECT id, 'Classified Ad', 'ad', 5000 
FROM public.newsletters WHERE slug = 'frontier';