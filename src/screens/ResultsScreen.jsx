import Button from "../components/Button";
import Card from "../components/Card";
import PricingSection from "../components/ui/pricing-section";

export default function ResultsScreen({ formData, processors, processorDiscounts, onRestart, onSeeDiscounts }) {
  const isValid = formData.monthlyCardVolume && formData.averageTransaction && formData.inPersonSplit && formData.internationalPercentage;

  const missingFields = [];
  if (!formData.monthlyCardVolume) missingFields.push("monthly card volume");
  if (!formData.averageTransaction) missingFields.push("average transaction amount");
  if (!formData.inPersonSplit) missingFields.push("in-person sales percentage");
  if (!formData.internationalPercentage) missingFields.push("international sales percentage");

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md" glowColor="red">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Comparison not generated</h2>
            <p className="text-gray-500 mb-4">We could not generate your comparison because some required information is missing.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800 mb-2">Missing information:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="primary" onClick={onRestart} className="w-full">Start over</Button>
          </div>
        </Card>
      </div>
    );
  }

  return <PricingSection processors={processors} formData={formData} onRestart={onRestart} onSeeDiscounts={onSeeDiscounts} />;
}