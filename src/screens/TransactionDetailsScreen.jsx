/**
 * Transaction Details screen for Marginly.
 * Collects international sales percentage and chargeback history.
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
import validationLimits from "../utils/validationLimits";

export default function TransactionDetailsScreen({ formData, setFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNext = () => {
    const newErrors = {};
    const intl = parseFloat(formData.internationalPercentage);
    const cb = parseFloat(formData.chargebacks);
    const { internationalPercent, chargebacksLastYear } = validationLimits;

    if (!formData.internationalPercentage?.trim()) {
      newErrors.internationalPercentage = "Please enter your international sales percentage";
    } else if (isNaN(intl) || intl < internationalPercent.min || intl > internationalPercent.max) {
      newErrors.internationalPercentage = "International percentage must be between 0 and 100";
    }

    // Chargebacks field is optional, but if entered must be a whole number in range
    if (formData.chargebacks?.trim()) {
      if (isNaN(cb) || cb < chargebacksLastYear.min || cb > chargebacksLastYear.max) {
        newErrors.chargebacks = `Chargebacks must be a whole number between ${chargebacksLastYear.min} and ${chargebacksLastYear.max.toLocaleString()}`;
      } else if (!Number.isInteger(cb)) {
        newErrors.chargebacks = "Chargebacks must be a whole number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">
            Transaction details
          </h2>
          <p className="text-gray-500 text-sm">
            Help us understand your transaction patterns
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            label="International sales percentage"
            id="internationalPercentage"
            type="number"
            value={formData.internationalPercentage || ""}
            onChange={handleChange("internationalPercentage")}
            placeholder="e.g., 15"
            error={errors.internationalPercentage}
            helper="Percentage of sales from customers outside your country"
            required
          />

          <FormField
            label="Chargebacks in the last year"
            id="chargebacks"
            type="number"
            value={formData.chargebacks || ""}
            onChange={handleChange("chargebacks")}
            placeholder="e.g., 5"
            error={errors.chargebacks}
            helper="Number of chargeback disputes (optional — we'll use an average if left blank)"
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
  );
}