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
 * - options: array of { value, label } - when provided, renders a native
 *   <select> styled exactly like the text inputs; otherwise renders <input>.
 *   Passed down from FormField so the parent controls the rendering mode.
 */
import { ChevronDown } from "lucide-react";

export default function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = false,
  disabled = false,
  className = "",
  options,
}) {
  const baseStyles = "w-full px-4 py-3 rounded-lg border text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none";

  const stateStyles = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 focus:ring-navy-500 focus:border-navy-500";

  // When options are provided, render a native <select> so the dropdown is
  // keyboard-accessible and labelled by the surrounding FormField label.
  if (options) {
    return (
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseStyles} ${stateStyles} pr-10 ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
    );
  }

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