-- ============================================================================
-- Marginly: save_comparison atomic function
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New
-- query).  It is safe to re-run: CREATE OR REPLACE replaces the function.
-- ============================================================================

-- The function body runs as a single transaction: if any INSERT fails,
-- every change is rolled back (atomicity).  This means you never end up
-- with a profile row but no matching results, or partial discounts.
--
-- EXECUTE is revoked from anon and authenticated roles so that a browser
-- user cannot call this function directly with a spoofed user_id.
-- Only the service_role (used by the Python backend) may call it.

create or replace function save_comparison(
  p_user_id  uuid,
  p_profile  jsonb,
  p_results  jsonb,
  p_discounts jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_profile_id uuid;
  r            jsonb;
begin
  -- 1. Insert the business profile and capture its new id
  insert into business_profiles (
    user_id, monthly_volume, avg_transaction,
    in_person_percent, international_percent,
    chargebacks_last_year, industry
  ) values (
    p_user_id,
    (p_profile->>'monthly_volume')::numeric,
    (p_profile->>'avg_transaction')::numeric,
    (p_profile->>'in_person_percent')::numeric,
    (p_profile->>'international_percent')::numeric,
    nullif(p_profile->>'chargebacks_last_year','')::integer,
    p_profile->>'industry'
  )
  returning id into v_profile_id;

  -- 2. Insert ranked results (one row per processor)
  for r in select * from jsonb_array_elements(p_results) loop
    insert into results (user_id, profile_id, processor_name, calculated_cost, rank)
    values (
      p_user_id,
      v_profile_id,
      r->>'processor_name',
      (r->>'calculated_cost')::numeric,
      (r->>'rank')::integer
    );
  end loop;

  -- 3. Insert discounts — only if the user doesn't already have one
  --    for that processor (first-comparison-wins).
  for r in select * from jsonb_array_elements(p_discounts) loop
    if not exists (
      select 1 from discounts
      where user_id = p_user_id
        and processor_name = r->>'processor_name'
    ) then
      insert into discounts (user_id, processor_name, discount_percent)
      values (
        p_user_id,
        r->>'processor_name',
        (r->>'discount_percent')::numeric
      );
    end if;
  end loop;

  return jsonb_build_object('profile_id', v_profile_id);
end $$;

-- Lock down permissions: only the service_role backend may call this
revoke all on function save_comparison(uuid, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function save_comparison(uuid, jsonb, jsonb, jsonb)
  to service_role;