-- 1. Create a Test User (auth.users)
-- NOTE: The password is 'password'
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Fixed UUID for consistency
    'authenticated',
    'authenticated',
    'pilot@gmail.com',
    crypt('password', gen_salt('bf')), -- Password is 'password'
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Create the Public Profile
INSERT INTO public.profiles (id, username, full_name, avatar_url, stripe_account_id)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'pilot_dev', 
    'Pilot Developer', 
    '', 
    NULL -- Start unconnected so you can test the "Connect Stripe" flow
) ON CONFLICT (id) DO NOTHING;

-- 3. Create the Newsletter
INSERT INTO public.newsletters (id, owner_id, name, slug, description)
VALUES (
    'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'The Frontier',
    'frontier',
    'Daily tech news from the edge of space.'
) ON CONFLICT (id) DO NOTHING;

-- 4. Create Inventory Tiers
INSERT INTO public.inventory_tiers (id, newsletter_id, name, type, description, price)
VALUES 
(
    'c2d0c999-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Main Sponsor',
    'sponsor',
    'Top of the email, logo and 150 words.',
    5000 -- $50.00
),
(
    'c2d0c999-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Classified Ad',
    'ad',
    'Text only link at the bottom.',
    1500 -- $15.00
) ON CONFLICT (id) DO NOTHING;