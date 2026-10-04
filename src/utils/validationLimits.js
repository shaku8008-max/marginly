/**
 * Validation limits — single source of truth for frontend field constraints.
 *
 * These limits are mirrored in:
 *   - backend/app/models/business_profile.py (Pydantic Field constraints)
 *   - supabase/migrations/002_hardening_and_industries.sql (CHECK constraints)
 *
 * If you change a limit here, update the other two files to match.
 */

const validationLimits = {
  monthlyVolume:       { min: 1,        max: 10_000_000 },
  avgTransaction:      { min: 0.01,     max: 100_000 },
  inPersonPercent:     { min: 0,        max: 100 },
  internationalPercent:{ min: 0,        max: 100 },
  chargebacksLastYear: { min: 0,        max: 10_000 },  // whole number
};

export default validationLimits;