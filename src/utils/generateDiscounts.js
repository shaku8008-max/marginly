/**
 * Generate a random discount percentage (between 2% and 5%, one decimal place)
 * for each payment processor. Called once and stored in App.jsx state so the
 * values stay stable across re-renders and navigation within the same session.
 *
 * @param {Array} processors - Array of processor objects (needs at least a `name` field)
 * @returns {Object} Map of processor name to discount percentage, e.g. { Stripe: 3.4, Square: 4.8 }
 */
export function generateRandomDiscounts(processors) {
  const discounts = {};
  processors.forEach((processor) => {
    // Random number between 2 and 5, rounded to one decimal place
    discounts[processor.name] = Math.round((Math.random() * 3 + 2) * 10) / 10;
  });
  return discounts;
}
