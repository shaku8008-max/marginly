/**
 * Utility function to merge Tailwind CSS classes.
 * Simple implementation of clsx + tailwind-merge.
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim();
}