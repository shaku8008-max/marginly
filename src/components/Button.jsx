/**
 * Button component with primary and secondary variants.
 * Used across all screens for form submissions and navigation.
 *
 * Props:
 * - variant: "primary" | "secondary" - button style variant
 * - children: content to display inside the button
 * - disabled: boolean - disables the button when true
 * - loading: boolean - when true the button is disabled and shows "Please wait…"
 *   instead of its children. Use on any button that triggers an async action
 *   (network call, auth, submit) to prevent double-submits.
 * - onClick: function - click handler
 * - type: "button" | "submit" - button type
 * - className: string - additional CSS classes
 */
export default function Button({
  variant = "primary",
  children,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
}) {
  const isDisabled = disabled || loading;

  const baseStyles = "px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-navy-800 text-white hover:bg-navy-700 focus:ring-navy-500",
    secondary: "bg-white text-navy-800 border-2 border-navy-800 hover:bg-gray-50 focus:ring-navy-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? "Please wait\u2026" : children}
    </button>
  );
}