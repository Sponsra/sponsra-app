-- 1. Create a Test User (auth.users)
-- NOTE: The password is 'password'
-- Delete existing data in correct order to avoid foreign key issues
-- Delete in reverse dependency order
DELETE FROM public.inventory_tiers WHERE newsletter_id = 'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22';
DELETE FROM public.newsletters WHERE id = 'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22';
DELETE FROM public.profiles WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM auth.users WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

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
);

-- 2. Create/Update the Public Profile
-- Use DO UPDATE to ensure all fields are set correctly
INSERT INTO public.profiles (id, username, full_name, avatar_url, stripe_account_id)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'pilot_dev', 
    'Pilot Developer', 
    '', 
    'acct_1SpZ0DF3JAAtRzzF' -- Stripe Connect account ID
) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    stripe_account_id = EXCLUDED.stripe_account_id;

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
-- 4. Create Inventory Tiers
INSERT INTO public.inventory_tiers (
    id, 
    newsletter_id, 
    name, 
    type, 
    format,
    price, 
    description,
    specs_headline_limit,
    specs_body_limit,
    specs_image_ratio,
    available_days,
    is_active
)
VALUES 
-- 1. Primary Sponsor (Hero)
(
    'c2d0c999-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Primary Sponsor',
    'ad',
    'hero',
    50000, -- $500.00
    'Primary sponsorship with image',
    60,
    280,
    '1.91:1',
    '{1, 2, 3, 4, 5}',
    true
),
-- 2. Mid-Roll (Native)
(
    'c2d0c999-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Mid-Roll',
    'ad',
    'native',
    25000, -- $250.00
    'Text-only mid-roll placement',
    80,
    400,
    'no_image',
    '{1, 2, 3, 4, 5}',
    true
),
-- 3. Classified (Link)
(
    'c2d0c999-9c0b-4ef8-bb6d-6bb9bd380a55',
    'b1f0c999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Classified',
    'ad',
    'link',
    10000, -- $100.00
    'Simple classified-style link (URL + text only)',
    100,
    0,
    'no_image',
    '{1, 2, 3, 4, 5}',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    format = EXCLUDED.format,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    specs_headline_limit = EXCLUDED.specs_headline_limit,
    specs_body_limit = EXCLUDED.specs_body_limit,
    specs_image_ratio = EXCLUDED.specs_image_ratio,
    available_days = EXCLUDED.available_days;