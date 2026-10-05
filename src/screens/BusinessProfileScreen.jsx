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

  // --- Industry dropdown options (built from the single industries.js list) ---
  const industryOptions = [
    { value: "", label: "Select your industry" },
    ...industries.map((ind) => ({ value: ind.name, label: ind.name })),
  ];

  // Look up the selected industry; fall back to null if the stored name
  // doesn't match any entry (e.g. stale saved data).
  const selectedIndustry = industries.find((ind) => ind.name === formData.industry) || null;

  // Tone for the profile card: the industry's themeKey, or neutral when none selected.
  const tone = selectedIndustry ? selectedIndustry.themeKey : "neutral";
  const theme = selectedIndustry ? industryThemes[selectedIndustry.themeKey] : industryThemes.neutral;

  const handleNext = () => {
    const newErrors = {};
    const vol = parseFloat(formData.monthlyCardVolume);
    const avg = parseFloat(formData.averageTransaction);
    const inPerson = parseFloat(formData.inPersonSplit);
    const { monthlyVolume, avgTransaction, inPersonPercent } = validationLimits;

    if (!selectedIndustry) {
      newErrors.industry = "Please choose your industry";
    }

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
        {/* Welcome-back card — stays neutral; only the profile card is tinted */}
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

      {/* Main profile card — tone changes with the selected industry */}
      <Card
        tone={tone}
        className="w-full p-6 transition-colors duration-300"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">
            Business profile
          </h2>
          <p className="text-gray-500 text-sm">
            Tell us about your business to get accurate comparisons
          </p>
        </div>

        <div className="space-y-4">
          {/* Industry dropdown — replaces the previous card grid */}
          <FormField
            label="Industry"
            id="industry"
            value={selectedIndustry ? selectedIndustry.name : ""}
            onChange={handleChange("industry")}
            error={errors.industry}
            helper="Chargeback risk varies by industry"
            options={industryOptions}
            required
          />

          {/* Industry pill + description — updates immediately on selection */}
          {selectedIndustry && (
            <div className="flex items-center gap-2 -mt-2 mb-2">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${theme.pill}`}
              >
                {selectedIndustry.name}
              </span>
              <span className="text-sm text-gray-500">
                {selectedIndustry.description}
              </span>
            </div>
          )}

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