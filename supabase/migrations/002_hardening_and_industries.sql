-- ============================================================================
-- Marginly: hardening constraints and expanded industries
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run: ALTER IF EXISTS and ON CONFLICT DO NOTHING prevent
-- errors if any statement has already been applied.
-- ============================================================================

-- ── 1. Extend industry_multipliers with theme and description ──────────────

alter table industry_multipliers add column if not exists theme_key text;
alter table industry_multipliers add column if not exists description text;
alter table industry_multipliers add constraint industry_multipliers_industry_key unique (industry);

-- Update the three existing rows
update industry_multipliers set theme_key = 'sky',   description = 'Shops and in-person selling'       where industry = 'Retail';
update industry_multipliers set theme_key = 'amber', description = 'Cafes, restaurants and takeaway'   where industry = 'Restaurant';
update industry_multipliers set theme_key = 'violet',description = 'Professional and personal services' where industry = 'Services';

-- Insert the five new industries (skip if they already exist)
insert into industry_multipliers (industry, chargeback_multiplier, theme_key, description) values
  ('Ecommerce',                1.4, 'emerald', 'Online stores shipping physical goods'),
  ('Health & wellness',        0.9, 'teal',    'Clinics, studios and wellness providers'),
  ('Travel & hospitality',     1.5, 'orange',  'Accommodation, tours and bookings'),
  ('Beauty & personal care',   0.9, 'rose',    'Salons, spas and barbers'),
  ('Digital goods & software', 1.6, 'indigo',  'Subscriptions, apps and downloads')
on conflict (industry) do nothing;


-- ── 2. Foreign key: business_profiles.industry → industry_multipliers ──────

alter table business_profiles
  add constraint business_profiles_industry_fkey
  foreign key (industry) references industry_multipliers(industry);


-- ── 3. Range constraints on business_profiles ──────────────────────────────
-- These mirror the limits in src/utils/validationLimits.js and
-- backend/app/models/business_profile.py. Keep all three in sync.

alter table business_profiles
  add constraint chk_monthly_volume
    check (monthly_volume > 0 and monthly_volume <= 10000000),
  add constraint chk_avg_transaction
    check (avg_transaction > 0 and avg_transaction <= 100000 and avg_transaction <= monthly_volume),
  add constraint chk_in_person
    check (in_person_percent between 0 and 100),
  add constraint chk_international
    check (international_percent between 0 and 100),
  add constraint chk_chargebacks
    check (chargebacks_last_year between 0 and 10000);


-- ── 4. Constraints on discounts ────────────────────────────────────────────

alter table discounts
  add constraint discounts_user_processor_unique unique (user_id, processor_name);

alter table discounts
  add constraint chk_discount_percent check (discount_percent >= 0 and discount_percent <= 100);


-- ── 5. Constraints on results ──────────────────────────────────────────────

alter table results
  add constraint results_profile_processor_unique unique (profile_id, processor_name);

alter table results
  add constraint chk_result_rank check (rank >= 1);

alter table results
  add constraint chk_result_cost check (calculated_cost >= 0);