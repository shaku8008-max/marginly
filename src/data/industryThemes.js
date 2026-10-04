/**
 * Industry colour themes.
 *
 * Maps each themeKey (from industries.js) to COMPLETE Tailwind class strings.
 * We use literal classes, never template-string interpolation, so Tailwind
 * can detect and generate them at build time.
 *
 * Shade usage:
 *   50  — card background
 *   100 — pill background
 *   200 — card border
 *   300 — selected ring, left accent border
 *   800 — pill text, dark-on-light contrast
 *
 * All body text stays slate-800 / slate-700 for readability.
 */

const industryThemes = {
  neutral: {
    bg:      "bg-white",
    border:  "border-gray-200",
    ring:    "ring-gray-300",
    pill:    "bg-gray-100 text-gray-800",
    accent:  "border-l-gray-300",
  },
  sky: {
    bg:      "bg-sky-50",
    border:  "border-sky-200",
    ring:    "ring-sky-300",
    pill:    "bg-sky-100 text-sky-800",
    accent:  "border-l-sky-300",
  },
  amber: {
    bg:      "bg-amber-50",
    border:  "border-amber-200",
    ring:    "ring-amber-300",
    pill:    "bg-amber-100 text-amber-800",
    accent:  "border-l-amber-300",
  },
  violet: {
    bg:      "bg-violet-50",
    border:  "border-violet-200",
    ring:    "ring-violet-300",
    pill:    "bg-violet-100 text-violet-800",
    accent:  "border-l-violet-300",
  },
  emerald: {
    bg:      "bg-emerald-50",
    border:  "border-emerald-200",
    ring:    "ring-emerald-300",
    pill:    "bg-emerald-100 text-emerald-800",
    accent:  "border-l-emerald-300",
  },
  teal: {
    bg:      "bg-teal-50",
    border:  "border-teal-200",
    ring:    "ring-teal-300",
    pill:    "bg-teal-100 text-teal-800",
    accent:  "border-l-teal-300",
  },
  orange: {
    bg:      "bg-orange-50",
    border:  "border-orange-200",
    ring:    "ring-orange-300",
    pill:    "bg-orange-100 text-orange-800",
    accent:  "border-l-orange-300",
  },
  rose: {
    bg:      "bg-rose-50",
    border:  "border-rose-200",
    ring:    "ring-rose-300",
    pill:    "bg-rose-100 text-rose-800",
    accent:  "border-l-rose-300",
  },
  indigo: {
    bg:      "bg-indigo-50",
    border:  "border-indigo-200",
    ring:    "ring-indigo-300",
    pill:    "bg-indigo-100 text-indigo-800",
    accent:  "border-l-indigo-300",
  },
};

export default industryThemes;