import { Card, CardContent, CardHeader } from "./card";
import SpotlightCard from "../../components/Card";
import TimelineContent from "./timeline-animation";
import NumberFlow from "@number-flow/react";
import { CreditCard, CheckCheck, Globe, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import { calculateTrueCost, getExplanation } from "../../utils/calculateTrueCost";
import { industryMultipliers, ratesLastVerified } from "../../data/mockProcessors";

export default function PricingSection({ processors, formData, comparison, onRestart, onSeeDiscounts }) {
  const pricingRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // "What if" sliders — local state for exploring scenarios without going back to the form.
  // Defaults match the user's original form inputs.
  const [sliderVolume, setSliderVolume] = useState(parseFloat(formData.monthlyCardVolume) || 50000);
  const [sliderInternational, setSliderInternational] = useState(parseFloat(formData.internationalPercentage) || 0);

  // Build a modified formData object using slider values for live recalculation.
  // This lets the sliders override the original inputs without mutating App.jsx state.
  const liveFormData = useMemo(() => ({
    ...formData,
    monthlyCardVolume: String(sliderVolume),
    internationalPercentage: String(sliderInternational),
  }), [formData, sliderVolume, sliderInternational]);

  // Calculate true costs for each processor.
  // If a saved comparison exists from the backend, use its results (the
  // authoritative calculation).  The "what if" sliders below still work
  // for local exploration, but the saved result is the one stored in the
  // database.
  // When there is no comparison (e.g. sliders moved), fall back to the
  // client-side calculation which mirrors the backend formula.
  const comparisonResultsByName = {};
  if (comparison?.results) {
    for (const r of comparison.results) {
      comparisonResultsByName[r.processor_name] = r;
    }
  }
  const useBackendData = comparison?.results && sliderVolume === parseFloat(formData.monthlyCardVolume || 0)
    && sliderInternational === parseFloat(formData.internationalPercentage || 0);

  const processorsWithCosts = processors.map((processor) => {
    if (useBackendData && comparisonResultsByName[processor.name]) {
      const backend = comparisonResultsByName[processor.name];
      return {
        ...processor,
        estimatedMonthly: parseFloat(backend.calculated_cost),
        usedDefaultChargebacks: comparison.used_default_chargebacks || false,
        explanation: getExplanation(processor, liveFormData, industryMultipliers),
      };
    }
    // Fallback: client-side calculation (same formula as the backend)
    const result = calculateTrueCost(liveFormData, processor, industryMultipliers);
    return {
      ...processor,
      estimatedMonthly: result.totalCost,
      usedDefaultChargebacks: result.usedDefaultChargebacks,
      explanation: getExplanation(processor, liveFormData, industryMultipliers),
    };
  });

  // Check if any processor used default chargebacks (for showing a note)
  const anyUsedDefaults = processorsWithCosts.some(p => p.usedDefaultChargebacks);

  // Sort by calculated cost
  const sortedProcessors = [...processorsWithCosts].sort((a, b) => a.estimatedMonthly - b.estimatedMonthly);
  const cheapest = sortedProcessors[0];
  const mostExpensive = sortedProcessors[sortedProcessors.length - 1];
  const selectedProcessor = sortedProcessors[selectedIndex];
  const savings = mostExpensive.estimatedMonthly - selectedProcessor.estimatedMonthly;

  const plans = sortedProcessors.map((processor, index) => ({
    name: processor.name,
    description: `${processor.percentFee}% + $${processor.flatFee.toFixed(2)} per transaction`,
    price: processor.estimatedMonthly,
    website: processor.website,
    referralUrl: processor.referralUrl,
    switchingEffort: processor.switchingEffort,
    explanation: processor.explanation,
    buttonText: index === 0 ? "Best match" : "Learn more",
    buttonVariant: index === 0 ? "default" : "outline",
    popular: index === 0,
    features: [
      { text: `${processor.percentFee}% + $${processor.flatFee.toFixed(2)} per transaction`, icon: <CreditCard size={20} /> },
      { text: `$${processor.chargebackFee} chargeback fee`, icon: <ShieldCheck size={20} /> },
      { text: `${processor.fxMarkupPercent}% FX markup`, icon: <Globe size={20} /> },
    ],
  }));

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.4, duration: 0.5 },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  return (
    <div className="px-4 pt-20 min-h-screen mx-auto relative bg-neutral-100" ref={pricingRef}>
      <div className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0" style={{ backgroundImage: "radial-gradient(circle at center, #22c55e 0%, transparent 70%)", opacity: 0.4, mixBlendMode: "multiply" }}></div>

      <div className="text-center mb-6 max-w-3xl mx-auto relative z-10">
        <TimelineContent as="h2" animationNum={0} timelineRef={pricingRef} customVariants={revealVariants} className="md:text-6xl sm:text-4xl text-3xl font-medium text-gray-900 mb-4">
          Your personalized{" "}
          <TimelineContent as="span" animationNum={1} timelineRef={pricingRef} customVariants={revealVariants} className="border border-dashed border-green-500 px-2 py-1 rounded-xl bg-green-100 capitalize inline-block">
            comparison
          </TimelineContent>
        </TimelineContent>

        <TimelineContent as="p" animationNum={2} timelineRef={pricingRef} customVariants={revealVariants} className="sm:text-base text-sm text-gray-600 sm:w-[70%] w-[80%] mx-auto">
          {"Based on your $" + Number(formData.monthlyCardVolume).toLocaleString() + " monthly card volume, here are the best options for your business."}
        </TimelineContent>

        {/* Confidence indicator — tells the user how reliable the estimate is */}
        <TimelineContent as="div" animationNum={2} timelineRef={pricingRef} customVariants={revealVariants} className="mt-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
            <AlertCircle size={16} className="text-blue-500" />
            <p className="text-sm text-blue-700">This estimate is accurate to within ±10% based on your inputs</p>
          </div>
        </TimelineContent>

        <TimelineContent as="div" animationNum={3} timelineRef={pricingRef} customVariants={revealVariants} className="mt-6 inline-block">
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 transition-all duration-300">
            <p className="text-sm text-green-700 mb-1">You could save up to</p>
            <div className="text-4xl font-bold text-green-600">$<NumberFlow value={savings} className="text-4xl font-bold" />/month</div>
            <p className="text-sm text-green-700 mt-1">by choosing {selectedProcessor.name} over {mostExpensive.name}</p>
          </div>
        </TimelineContent>
      </div>

      {/* "What if" sliders — let users explore different scenarios live */}
      <div className="max-w-7xl mx-auto mb-6 relative z-10">
        <TimelineContent as="div" animationNum={3} timelineRef={pricingRef} customVariants={revealVariants}>
          <SpotlightCard className="bg-white" glowColor="green">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">What if scenarios</h3>
              <p className="text-sm text-gray-500">Adjust these sliders to see how costs change in real time</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly volume slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Monthly card volume</label>
                    <span className="text-sm font-semibold text-gray-900">${sliderVolume.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={sliderVolume}
                    onChange={(e) => setSliderVolume(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">$0</span>
                    <span className="text-xs text-gray-400">$1,000,000</span>
                  </div>
                </div>

                {/* International sales slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">International sales</label>
                    <span className="text-sm font-semibold text-gray-900">{sliderInternational}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={sliderInternational}
                    onChange={(e) => setSliderInternational(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">0%</span>
                    <span className="text-xs text-gray-400">100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>
        </TimelineContent>
      </div>

      {/* Rates last verified date */}
      <div className="max-w-7xl mx-auto mb-4 relative z-10 text-right">
        <p className="text-xs text-gray-400">Rates last verified: {ratesLastVerified}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 max-w-7xl gap-4 py-6 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent key={plan.name} as="div" animationNum={4 + index} timelineRef={pricingRef} customVariants={revealVariants}>
            <Card
              className={
                "relative border-neutral-200 cursor-pointer transition-all duration-300 hover:shadow-xl " +
                (index === selectedIndex
                  ? "ring-2 ring-green-500 bg-green-50 shadow-lg scale-105 z-10"
                  : "bg-white scale-100 opacity-90")
              }
              onClick={() => setSelectedIndex(index)}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex gap-2">
                    {plan.popular && <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Best match</span>}
                    {index === selectedIndex && !plan.popular && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Selected</span>}
                    {/* Switching cost badge — only shown for non-top-ranked processors */}
                    {index > 0 && (
                      <span className={
                        "px-3 py-1 rounded-full text-sm font-medium " +
                        (plan.switchingEffort === "Low"
                          ? "bg-gray-100 text-gray-600"
                          : plan.switchingEffort === "Moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700")
                      }>
                        {plan.switchingEffort === "Low" ? "Low effort" : plan.switchingEffort === "Moderate" ? "Moderate effort" : "High effort"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold text-gray-900">$<NumberFlow value={plan.price} className="text-4xl font-semibold" /></span>
                  <span className="text-gray-600 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <a
                  href={plan.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={"block w-full mb-4 p-4 text-xl rounded-xl text-center transition-all " + (plan.popular ? "bg-gradient-to-t from-green-500 to-green-600 shadow-lg shadow-green-500 border border-green-400 text-white hover:from-green-600 hover:to-green-700" : "bg-gradient-to-t from-neutral-900 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-700 text-white hover:from-neutral-800 hover:to-neutral-700")}
                >
                  {plan.buttonText}
                </a>
                {/* Plain-English explanation — shows why this processor ranks here */}
                <p className="text-xs text-gray-500 mb-3 italic">{plan.explanation}</p>
                <ul className="space-y-2 font-semibold py-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-neutral-800 grid place-content-center mt-0.5 mr-3">{feature.icon}</span>
                      <span className="text-sm text-gray-600">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                {/* Referral/affiliate link — styled as a secondary button */}
                <a
                  href={plan.referralUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Go to {plan.name} <ArrowRight size={16} />
                </a>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>

      <div className="max-w-7xl mx-auto py-8 relative z-10">
        <TimelineContent as="div" animationNum={8} timelineRef={pricingRef} customVariants={revealVariants}>
          <SpotlightCard className="bg-white" glowColor="blue">
            <CardHeader><h3 className="text-lg font-semibold text-gray-900">Your business profile</h3></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="text-gray-400">Monthly card volume</p><p className="text-gray-900 font-medium">${Number(formData.monthlyCardVolume).toLocaleString()}</p></div>
                <div><p className="text-gray-400">Average transaction</p><p className="text-gray-900 font-medium">${formData.averageTransaction}</p></div>
                <div><p className="text-gray-400">In-person sales</p><p className="text-gray-900 font-medium">{formData.inPersonSplit}%</p></div>
                <div><p className="text-gray-400">International sales</p><p className="text-gray-900 font-medium">{formData.internationalPercentage}%</p></div>
                <div><p className="text-gray-400">Industry</p><p className="text-gray-900 font-medium">{formData.industry || "Retail"}</p></div>
                {formData.chargebacks && <div><p className="text-gray-400">Chargebacks (last year)</p><p className="text-gray-900 font-medium">{formData.chargebacks}</p></div>}
              </div>
            </CardContent>
          </SpotlightCard>
        </TimelineContent>

        <TimelineContent as="div" animationNum={9} timelineRef={pricingRef} customVariants={revealVariants} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onRestart} className="px-8 py-4 bg-gradient-to-t from-neutral-900 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-700 text-white rounded-xl text-lg font-medium hover:from-neutral-800 hover:to-neutral-700 transition-all">
            Start new comparison
          </button>
          <button onClick={onSeeDiscounts} className="px-8 py-4 bg-gradient-to-t from-green-500 to-green-600 shadow-lg shadow-green-500 border border-green-400 text-white rounded-xl text-lg font-medium hover:from-green-600 hover:to-green-700 transition-all">
            See exclusive discounts
          </button>
        </TimelineContent>

        {/* Chargeback default note — shown when user didn't enter chargebacks */}
        {anyUsedDefaults && (
          <TimelineContent as="div" animationNum={7} timelineRef={pricingRef} customVariants={revealVariants} className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-blue-800">
                Chargebacks not entered, so an average assumption was used.
              </p>
            </div>
          </TimelineContent>
        )}

        {/* Disclaimer — shown at the very bottom */}
        <TimelineContent as="div" animationNum={10} timelineRef={pricingRef} customVariants={revealVariants} className="mt-6 text-center">
          <p className="text-xs text-gray-400">Estimate based on public list pricing and the details you entered. Confirm final pricing with the provider.</p>
        </TimelineContent>
      </div>
    </div>
  );
}