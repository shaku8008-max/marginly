/**
 * Calculate the true monthly cost for a payment processor based on business data.
 *
 * @param {Object} formData - Business payment data
 * @param {Object} processor - Processor rate structure
 * @param {Object} [industryMultipliers] - Optional map of industry to chargeback risk multiplier
 * @returns {{ totalCost: number, usedDefaultChargebacks: boolean }}
 */

// When the user skips the chargebacks field we assume a low-average figure
// rather than zero, so the estimate still reflects real-world risk.
const DEFAULT_ANNUAL_CHARGEBACKS = 2;

export function calculateTrueCost(formData, processor, industryMultipliers = {}) {
  const monthlyVolume = parseFloat(formData.monthlyCardVolume) || 0;
  const avgTransactionSize = parseFloat(formData.averageTransaction) || 0;
  const internationalPercent = parseFloat(formData.internationalPercentage) || 0;

  // Apply industry-based chargeback risk multiplier
  const industry = formData.industry || "Retail";
  const chargebackMultiplier = industryMultipliers[industry] || 1.0;

  // Guard against zero / missing avgTransactionSize to avoid division by zero.
  const transactionCount = avgTransactionSize > 0
    ? monthlyVolume / avgTransactionSize
    : 0;

  // Base cost: percentage fee on volume + flat fee per transaction
  const baseCost =
    monthlyVolume * (processor.percentFee / 100) +
    transactionCount * processor.flatFee;

  // Chargeback cost — annual count converted to monthly, then scaled by
  // the processor's per-chargeback fee and the industry risk multiplier.
  const rawChargebacks = parseFloat(formData.chargebacks);
  const hasExplicitChargebacks = !isNaN(rawChargebacks) && formData.chargebacks !== "";
  const annualChargebacks = hasExplicitChargebacks
    ? rawChargebacks
    : DEFAULT_ANNUAL_CHARGEBACKS;
  const monthlyChargebackCost =
    (annualChargebacks / 12) * processor.chargebackFee * chargebackMultiplier;

  // Foreign exchange cost
  const fxCost =
    monthlyVolume * (internationalPercent / 100) * (processor.fxMarkupPercent / 100);

  const totalCost = baseCost + monthlyChargebackCost + fxCost;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    usedDefaultChargebacks: !hasExplicitChargebacks,
  };
}

export function getExplanation(processor, formData, industryMultipliers = {}) {
  const monthlyVolume = parseFloat(formData.monthlyCardVolume) || 0;
  const internationalPercent = parseFloat(formData.internationalPercentage) || 0;
  const industry = formData.industry || "Retail";
  const chargebackMultiplier = industryMultipliers[industry] || 1.0;

  const avgTransactionSize = parseFloat(formData.averageTransaction) || 0;
  const transactionCount = avgTransactionSize > 0 ? monthlyVolume / avgTransactionSize : 0;

  const baseCost =
    monthlyVolume * (processor.percentFee / 100) +
    transactionCount * processor.flatFee;

  const rawChargebacks = parseFloat(formData.chargebacks);
  const annualChargebacks = (!isNaN(rawChargebacks) && formData.chargebacks !== "")
    ? rawChargebacks
    : DEFAULT_ANNUAL_CHARGEBACKS;
  const monthlyChargebackCost =
    (annualChargebacks / 12) * processor.chargebackFee * chargebackMultiplier;

  const fxCost =
    monthlyVolume * (internationalPercent / 100) * (processor.fxMarkupPercent / 100);

  const total = baseCost + monthlyChargebackCost + fxCost;

  const fxRatio = total > 0 ? fxCost / total : 0;
  const chargebackRatio = total > 0 ? monthlyChargebackCost / total : 0;

  if (internationalPercent === 0 && processor.chargebackFee === 0) {
    return `${processor.name} works well for you since you have no international sales and zero chargeback fees.`;
  }

  if (internationalPercent === 0) {
    return `${processor.name} suits your business since you have no international sales to pay FX fees on.`;
  }

  if (fxRatio > 0.3) {
    return `${processor.name} ranks here partly due to its ${processor.fxMarkupPercent}% FX markup on your ${internationalPercent}% international sales.`;
  }

  if (chargebackRatio > 0.3 && processor.chargebackFee > 0) {
    return `${processor.name}'s $${processor.chargebackFee} chargeback fee affects your cost given your ${industry.toLowerCase()} chargeback risk.`;
  }

  if (processor.chargebackFee === 0) {
    return `${processor.name} has no chargeback fee, which keeps your costs lower in ${industry.toLowerCase()}.`;
  }

  if (processor.percentFee < 2.0) {
    return `${processor.name}'s low ${processor.percentFee}% rate makes it competitive for your $${Number(monthlyVolume).toLocaleString()} monthly volume.`;
  }

  return `${processor.name} is a solid option for your ${industry.toLowerCase()} business at this volume.`;
}