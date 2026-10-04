/**
 * Industry definitions — single source of truth for the UI.
 *
 * Each entry provides the display name, a short description, a chargeback
 * risk multiplier used in cost calculations, and a themeKey that maps to
 * a colour scheme in industryThemes.js.
 *
 * NOTE: The multipliers below are illustrative assumptions for this MVP,
 * not sourced industry statistics. The long-term source of truth is the
 * industry_multipliers table in Supabase — once the frontend reads from
 * the backend, this array will be replaced by an API call.
 *
 * This list must stay in sync with the industry_multipliers table.
 * See supabase/migrations/002_hardening_and_industries.sql.
 */

const industries = [
  { name: "Retail",                   description: "Shops and in-person selling",              chargebackMultiplier: 1.0, themeKey: "sky" },
  { name: "Restaurant",               description: "Cafes, restaurants and takeaway",          chargebackMultiplier: 1.3, themeKey: "amber" },
  { name: "Services",                 description: "Professional and personal services",       chargebackMultiplier: 0.8, themeKey: "violet" },
  { name: "Ecommerce",                description: "Online stores shipping physical goods",    chargebackMultiplier: 1.4, themeKey: "emerald" },
  { name: "Health & wellness",        description: "Clinics, studios and wellness providers",  chargebackMultiplier: 0.9, themeKey: "teal" },
  { name: "Travel & hospitality",     description: "Accommodation, tours and bookings",        chargebackMultiplier: 1.5, themeKey: "orange" },
  { name: "Beauty & personal care",   description: "Salons, spas and barbers",                 chargebackMultiplier: 0.9, themeKey: "rose" },
  { name: "Digital goods & software", description: "Subscriptions, apps and downloads",        chargebackMultiplier: 1.6, themeKey: "indigo" },
];

export default industries;