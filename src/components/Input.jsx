/**
 * Input component for form fields.
 * Used inside FormField across all data-entry screens.
 *
 * Props:
 * - id: string - unique identifier for the input
 * - type: "text" | "email" | "password" | "number" - input type
 * - value: string - current input value
 * - onChange: function - change handler
 * - placeholder: string - placeholder text
 * - error: boolean - shows error styling when true
 * - disabled: boolean - disables the input when true
 * - className: string - additional CSS classes
 */
export default function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = false,
  disabled = false,
  className = "",
}) {
  const baseStyles = "w-full px-4 py-3 rounded-lg border text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed";
  
  const stateStyles = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 focus:ring-navy-500 focus:border-navy-500";

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${className}`}
    />
  );
}