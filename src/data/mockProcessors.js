/**
 * Mock payment processor rate structures.
 * Each processor stores their fee structure, not a pre-calculated cost.
 */

// Industry-based chargeback risk multipliers.
// Sourced from src/data/industries.js — kept here as a plain object for
// backward compatibility with calculateTrueCost's third argument.
// The long-term source of truth is the industry_multipliers table in Supabase.
export const industryMultipliers = {
  Retail: 1.0,
  Restaurant: 1.3,
  Services: 0.8,
  Ecommerce: 1.4,
  "Health & wellness": 0.9,
  "Travel & hospitality": 1.5,
  "Beauty & personal care": 0.9,
  "Digital goods & software": 1.6,
};

// Date when processor rates were last verified (mocked).
export const ratesLastVerified = "September 15, 2026";

export const mockProcessors = [
  {
    name: "Stripe",
    percentFee: 2.9,
    flatFee: 0.30,
    chargebackFee: 15,
    fxMarkupPercent: 1.5,
    website: "https://stripe.com",
    referralUrl: "https://stripe.com/your-affiliate-link",
    switchingEffort: "Low",
  },
  {
    name: "Square",
    percentFee: 2.6,
    flatFee: 0.10,
    chargebackFee: 0,
    fxMarkupPercent: 1.0,
    website: "https://squareup.com",
    referralUrl: "https://squareup.com/your-affiliate-link",
    switchingEffort: "Low",
  },
  {
    name: "Helcim",
    percentFee: 1.83,
    flatFee: 0.08,
    chargebackFee: 15,
    fxMarkupPercent: 1.0,
    website: "https://www.helcim.com",
    referralUrl: "https://www.helcim.com/your-affiliate-link",
    switchingEffort: "Moderate",
  },
  {
    name: "PayPal",
    percentFee: 2.89,
    flatFee: 0.29,
    chargebackFee: 20,
    fxMarkupPercent: 2.5,
    website: "https://www.paypal.com",
    referralUrl: "https://www.paypal.com/your-affiliate-link",
    switchingEffort: "Low",
  },
];