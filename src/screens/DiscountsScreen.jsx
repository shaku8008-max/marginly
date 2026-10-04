/**
 * Discounts screen for Marginly.
 * Shows industry-specific affiliate discounts for each processor,
 * with costs recalculated using the same formData already collected.
 *
 * Props:
 * - user: object - authenticated Supabase user (contains user.id)
 * - formData: object - business payment data from App.jsx
 * - processors: array - processor rate structures
 * - processorDiscounts: object - map of processor name to discount % (generated once in App.jsx)
 * - onBack: function - navigate back to results screen
 * - onLogout: function - sign out and return to login screen
 */
import Button from "../components/Button";
import SpotlightCard from "../components/Card";
import { CardContent, CardHeader } from "../components/ui/card";
import { calculateTrueCost } from "../utils/calculateTrueCost";
import { industryMultipliers } from "../data/mockProcessors";
import industries from "../data/industries";
import industryThemes from "../data/industryThemes";
import { Tag, ArrowLeft, TrendingDown, Check } from "lucide-react";

export default function DiscountsScreen({ formData, processors, processorDiscounts, onBack, onLogout }) {
  // Recalculate each processor's true monthly cost using the same formData and
  // industry multipliers — this is the same calculation as ResultsScreen, not a
  // fresh one. The discount is applied as a separate step on top.
  // Look up the selected industry's theme for tinting cards
  const selectedIndustry = industries.find(i => i.name === formData.industry) || industries[0];
  const theme = industryThemes[selectedIndustry.themeKey] || industryThemes.neutral;

  const processorsWithDiscounts = processors.map((processor) => {
    const trueMonthly = calculateTrueCost(formData, processor, industryMultipliers).totalCost;
    const discountPercent = processorDiscounts[processor.name] || 0;
    // Discounted cost = true monthly cost × (1 - discount % / 100)
    const discountedMonthly = Math.round(trueMonthly * (1 - discountPercent / 100) * 100) / 100;
    const monthlySavings = Math.round((trueMonthly - discountedMonthly) * 100) / 100;
    const annualSavings = Math.round(monthlySavings * 12 * 100) / 100;

    return {
      ...processor,
      trueMonthly,
      discountPercent,
      discountedMonthly,
      monthlySavings,
      annualSavings,
    };
  });

  // Sort by discounted cost so the best deal appears first
  const sortedProcessors = [...processorsWithDiscounts].sort(
    (a, b) => a.discountedMonthly - b.discountedMonthly
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-4 py-2 mb-4">
            <Tag size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Exclusive affiliate discounts</span>
          </div>
          <span className={"ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium " + theme.pill}>
            {selectedIndustry.name}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Your discounted rates
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Based on your business profile, here are exclusive discounts from each processor.
            These are applied on top of your true-cost estimates.
          </p>
        </div>

        {/* Discount cards — sorted by discounted cost, best deal highlighted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {sortedProcessors.map((processor, index) => (
            <SpotlightCard
              key={processor.name}
              tone={selectedIndustry.themeKey}
              className={
                "transition-all duration-300 " +
                (index === 0
                  ? "ring-2 ring-green-500 shadow-lg"
                  : "")
              }
              glowColor={index === 0 ? "green" : "blue"}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{processor.name}</h3>
                    <p className="text-sm text-gray-500">
                      {processor.percentFee}% + ${processor.flatFee.toFixed(2)} per transaction
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* Discount percentage badge */}
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <Tag size={14} />
                      {processor.discountPercent}% off
                    </span>
                    {index === 0 && (
                      <span className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <Check size={14} /> Best deal with discount
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Original true cost */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Original true cost</span>
                    <span className="text-lg text-gray-400 line-through">
                      ${processor.trueMonthly.toFixed(2)}/mo
                    </span>
                  </div>

                  {/* Discounted cost */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">With discount</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${processor.discountedMonthly.toFixed(2)}/mo
                    </span>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Monthly savings */}
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <TrendingDown size={14} className="text-green-500" />
                      Monthly savings
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ${processor.monthlySavings.toFixed(2)}
                    </span>
                  </div>

                  {/* Annual savings */}
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <TrendingDown size={14} className="text-green-500" />
                      Annual savings
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${processor.annualSavings.toFixed(2)}
                    </span>
                  </div>

                  {/* Visit processor link */}
                  <a
                    href={processor.referralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-3 px-4 py-3 rounded-lg text-center font-medium transition-all bg-gradient-to-t from-green-500 to-green-600 text-white shadow-md hover:from-green-600 hover:to-green-700"
                  >
                    Claim {processor.discountPercent}% discount at {processor.name}
                  </a>
                </div>
              </CardContent>
            </SpotlightCard>
          ))}
        </div>

        {/* Disclosure text — visible near discount figures, not fine print */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-center">
          <p className="text-sm text-amber-800 leading-relaxed">
            Marginly may earn a referral fee when you sign up through these links.
            Discounts are shown transparently and don't change the accuracy of your
            true-cost calculation.
          </p>
        </div>

        {/* Navigation and logout buttons */}
        <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" onClick={onBack} className="inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to comparison
          </Button>
          <Button variant="secondary" onClick={onLogout} className="inline-flex items-center gap-2">
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}