/**
 * Login screen for Marginly.
 * Supports both sign-up (new user) and sign-in (returning user) via Supabase Auth.
 * Validates fields locally before making any network request.
 *
 * Props:
 * - onLogin: function(user) - called with the Supabase user object on successful auth
 */
import { useState } from "react";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Card from "../components/Card";
import supabase from "../services/supabaseClient";

/**
 * Maps raw Supabase auth error messages to plain-English text that a
 * non-technical small business owner can understand.
 */
function friendlyAuthError(message) {
  const lower = (message || "").toLowerCase();

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please check your inbox and confirm your email before logging in.";
  }

  return "Something went wrong. Please try again.";
}

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const handleAuth = async () => {
    // --- Client-side validation first (no network request yet) ---
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Please enter your email address";
    }

    if (!password.trim()) {
      newErrors.password = "Please enter your password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setAuthError("");
    setLoading(true);

    if (authMode === "signup") {
      // signUp creates a new user account and sends a confirmation email.
      // The returned data.user object contains the new user's id and email.
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);

      if (error) {
        setAuthError(friendlyAuthError(error.message));
        return;
      }

      onLogin(data.user);
    } else {
      // signInWithPassword verifies the email+password and returns a session
      // with an access token and the authenticated user.
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (error) {
        setAuthError(friendlyAuthError(error.message));
        return;
      }

      onLogin(data.user);
    }
  };

  const toggleMode = () => {
    setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
    setAuthError("");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Marginly</h1>
          <p className="text-gray-500">
            {authMode === "login"
              ? "Sign in to access your business profile"
              : "Create an account to get started"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Auth-level error banner — shown above fields for visibility */}
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}

          <FormField
            label="Email address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
              setAuthError("");
            }}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <FormField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
              setAuthError("");
            }}
            placeholder="Enter your password"
            error={errors.password}
            required
          />

          <Button
            variant="primary"
            onClick={handleAuth}
            loading={loading}
            className="w-full mt-6"
          >
            {authMode === "login" ? "Log in" : "Sign up"}
          </Button>
        </div>

        {/* Toggle between login and sign-up */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {authMode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-navy-800 font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-navy-800 font-medium hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}