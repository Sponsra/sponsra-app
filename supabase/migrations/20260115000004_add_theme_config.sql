-- Add theme_config column to newsletters table
-- This stores the newsletter's branding configuration (colors, fonts, layout)

alter table newsletters
add column if not exists theme_config jsonb;

-- Add a comment to document the structure
comment on column newsletters.theme_config is 'JSON object with keys: primary_color (hex string), font_family (sans|serif|mono), layout_style (minimal|boxed)';
