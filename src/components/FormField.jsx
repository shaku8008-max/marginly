/**
 * FormField wrapper component that renders a label, input, and optional helper/error text.
 * Used on login screen and both data-entry screens.
 *
 * Props:
 * - label: string - field label
 * - id: string - unique identifier for the input
 * - type: "text" | "email" | "password" | "number" - input type
 * - value: string - current input value
 * - onChange: function - change handler
 * - placeholder: string - placeholder text
 * - error: string - error message to display (if any)
 * - helper: string - helper text to display (optional)
 * - disabled: boolean - disables the input when true
 * - required: boolean - shows required indicator when true
 * - options: array of { value, label } - when provided, Input renders a
 *   native <select> instead of a text input (e.g. industry dropdown)
 */
import Input from "./Input";

export default function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helper = "",
  disabled = false,
  required = false,
  options,
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={!!error}
        disabled={disabled}
        options={options}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
      
      {helper && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}