/**
 * Business Profile screen for Marginly.
 * Collects business payment details: industry, monthly volume, average
 * transaction, and in-person sales split.
 *
 * Props:
 * - formData: object - current form data
 * - setFormData: function - update form data
 * - onNext: function - navigate to next screen
 * - onBack: function - navigate to previous screen
 */
import { useState } from "react";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Card from "../components/Card";
import industries from "../data/industries";
import industryThemes from "../data/industryThemes";
import validationLimits from "../utils/validationLimits";

export default function BusinessProfileScreen({ formData, setFormData, onNext, onBack, comparison }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNext = () => {
    const newErrors = {};
    const vol = parseFloat(formData.monthlyCardVolume);
    const avg = parseFloat(formData.averageTransaction);
    const inPerson = parseFloat(formData.inPersonSplit);
    const { monthlyVolume, avgTransaction, inPersonPercent } = validationLimits;

    if (!formData.monthlyCardVolume?.trim()) {
      newErrors.monthlyCardVolume = "Please enter your monthly card volume";
    } else if (isNaN(vol) || vol < monthlyVolume.min || vol > monthlyVolume.max) {
      newErrors.monthlyCardVolume = `Monthly volume must be between $${monthlyVolume.min.toLocaleString()} and $${monthlyVolume.max.toLocaleString()}`;
    }

    if (!formData.averageTransaction?.trim()) {
      newErrors.averageTransaction = "Please enter your average transaction amount";
    } else if (isNaN(avg) || avg < avgTransaction.min || avg > avgTransaction.max) {
      newErrors.averageTransaction = `Average transaction must be between $${avgTransaction.min} and $${avgTransaction.max.toLocaleString()}`;
    } else if (!isNaN(vol) && avg > vol) {
      newErrors.averageTransaction = "Average transaction can't be larger than your monthly card volume";
    }

    if (!formData.inPersonSplit?.trim()) {
      newErrors.inPersonSplit = "Please enter your in-person sales percentage";
    } else if (isNaN(inPerson) || inPerson < inPersonPercent.min || inPerson > inPersonPercent.max) {
      newErrors.inPersonSplit = "In-person percentage must be between 0 and 100";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Welcome-back card — shown when the user has a saved comparison */}
        {comparison && (
          <Card className="w-full">
            <div className="text-center p-2">
              <h3 className="text-lg font-bold text-navy-900 mb-1">Welcome back</h3>
              <p className="text-sm text-gray-500 mb-4">
                You have a saved comparison. Would you like to view it or start a new one?
              </p>
              <div className="flex gap-3">
                <Button variant="primary" onClick={onNext} className="flex-1">
                  View my comparison
                </Button>
                <Button variant="secondary" onClick={() => {}} className="flex-1">
                  Start a new one
                </Button>
              </div>
            </div>
          </Card>
        )}

      <Card className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">
            Business profile
          </h2>
          <p className="text-gray-500 text-sm">
            Tell us about your business to get accurate comparisons
          </p>
        </div>

        <div className="space-y-4">
          {/* Industry selector — responsive grid of tinted cards */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Select your industry"
            >
              {industries.map((ind) => {
                const isSelected = formData.industry === ind.name;
                const theme = industryThemes[ind.themeKey] || industryThemes.neutral;

                return (
                  <button
                    key={ind.name}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, industry: ind.name }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setFormData((prev) => ({ ...prev, industry: ind.name }));
                      }
                    }}
                    className={
                      "text-left p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 " +
                      theme.bg + " " +
                      (isSelected
                        ? theme.ring + " ring-2"
                        : theme.border + " hover:shadow-sm")
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">
                          {ind.name}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                          {ind.description}
                        </p>
                      </div>
                      <span
                        className={
                          "shrink-0 mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium " +
                          theme.pill
                        }
                      >
                        {ind.chargebackMultiplier}×
                      </span>
                    </div>
                    {isSelected && (
                      <p className="text-xs font-medium mt-1.5 text-slate-700">
                        ✓ Selected
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Chargeback risk varies by industry
            </p>
          </div>

          <FormField
            label="Monthly card volume"
            id="monthlyCardVolume"
            type="number"
            value={formData.monthlyCardVolume || ""}
            onChange={handleChange("monthlyCardVolume")}
            placeholder="e.g., 50000"
            error={errors.monthlyCardVolume}
            helper="Total amount processed via card payments each month"
            required
          />

          <FormField
            label="Average transaction amount"
            id="averageTransaction"
            type="number"
            value={formData.averageTransaction || ""}
            onChange={handleChange("averageTransaction")}
            placeholder="e.g., 75"
            error={errors.averageTransaction}
            helper="Typical amount per transaction"
            required
          />

          <FormField
            label="In-person sales percentage"
            id="inPersonSplit"
            type="number"
            value={formData.inPersonSplit || ""}
            onChange={handleChange("inPersonSplit")}
            placeholder="e.g., 60"
            error={errors.inPersonSplit}
            helper="Percentage of sales made in-person (vs online)"
            required
          />
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="secondary" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button variant="primary" onClick={handleNext} className="flex-1">
            Next
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}