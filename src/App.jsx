/**
 * Main App component for Marginly.
 * Handles routing, lifts state up for form data, authenticated user,
 * and saved comparison data.  Protects routes that require login.
 */
import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import BusinessProfileScreen from "./screens/BusinessProfileScreen";
import TransactionDetailsScreen from "./screens/TransactionDetailsScreen";
import ResultsScreen from "./screens/ResultsScreen";
import DiscountsScreen from "./screens/DiscountsScreen";
import { mockProcessors } from "./data/mockProcessors";
import { generateRandomDiscounts } from "./utils/generateDiscounts";
import supabase from "./services/supabaseClient";
import { apiFetch } from "./services/api";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Authenticated user state (null when logged out) ---
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    monthlyCardVolume: "",
    averageTransaction: "",
    inPersonSplit: "",
    internationalPercentage: "",
    chargebacks: "",
    industry: "Retail",
  });

  // --- Comparison state (saved to / loaded from the backend) ---
  const [comparison, setComparison] = useState(null);
  const [comparisonStatus, setComparisonStatus] = useState("idle"); // idle | loading | error
  const [comparisonError, setComparisonError] = useState("");

  // Generate random discount percentages once per session (local fallback only)
  const [processorDiscounts] = useState(() => generateRandomDiscounts(mockProcessors));

  // --- Fetch the user's latest saved comparison ---
  const fetchLatestComparison = useCallback(async () => {
    try {
      const data = await apiFetch("/api/comparisons/latest");
      if (data.comparison) {
        setComparison(data.comparison);
        return data.comparison;
      }
    } catch {
      // Silent fail — the user just won't see a welcome-back banner
    }
    return null;
  }, []);

  // List of routes that require an authenticated user
  const protectedPaths = ["/business-profile", "/transaction-details", "/results", "/discounts"];
  const isProtectedRoute = protectedPaths.includes(location.pathname);

  // If the user is not logged in and tries to access a protected route,
  // redirect them to the login screen
  if (!user && isProtectedRoute) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (userData) => {
    setUser(userData);
    // After login, try to load the latest comparison for the welcome-back banner
    const latest = await fetchLatestComparison();
    // Pre-fill form data from the latest comparison so the welcome-back card can use it
    if (latest?.profile) {
      setFormData({
        monthlyCardVolume: latest.profile.monthly_volume || "",
        averageTransaction: latest.profile.avg_transaction || "",
        inPersonSplit: latest.profile.in_person_percent || "",
        internationalPercentage: latest.profile.international_percent || "",
        chargebacks: latest.profile.chargebacks_last_year || "",
        industry: latest.profile.industry || "Retail",
      });
    }
    navigate("/business-profile");
  };

  // signOut clears the local session and revokes the refresh token on the server.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setComparison(null);
    setFormData({
      monthlyCardVolume: "",
      averageTransaction: "",
      inPersonSplit: "",
      internationalPercentage: "",
      chargebacks: "",
      industry: "Retail",
    });
    navigate("/");
  };

  const handleBusinessProfileNext = () => {
    navigate("/transaction-details");
  };

  const handleTransactionDetailsBack = () => {
    navigate("/business-profile");
  };

  // Called when the user clicks "Next" on the TransactionDetails screen.
  // Sends the profile to the backend, saves the comparison, then navigates.
  const handleTransactionDetailsSubmit = async () => {
    setComparisonStatus("loading");
    setComparisonError("");

    const payload = {
      monthly_volume: parseFloat(formData.monthlyCardVolume),
      avg_transaction: parseFloat(formData.averageTransaction),
      in_person_percent: parseFloat(formData.inPersonSplit),
      international_percent: parseFloat(formData.internationalPercentage),
      chargebacks_last_year: formData.chargebacks
        ? parseInt(formData.chargebacks, 10)
        : null,
      industry: formData.industry,
    };

    try {
      const data = await apiFetch("/api/comparisons", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setComparison(data);
      setComparisonStatus("idle");
      navigate("/results");
    } catch (err) {
      setComparisonStatus("error");
      setComparisonError(err.message || "We couldn't reach the server. Please try again.");
    }
  };

  const handleRestart = () => {
    navigate("/business-profile");
  };

  return (
    <Routes>
      <Route path="/" element={<LoginScreen onLogin={handleLogin} />} />
      <Route
        path="/business-profile"
        element={
          <BusinessProfileScreen
            user={user}
            formData={formData}
            setFormData={setFormData}
            onNext={handleBusinessProfileNext}
            onBack={() => navigate("/")}
            comparison={comparison}
          />
        }
      />
      <Route
        path="/transaction-details"
        element={
          <TransactionDetailsScreen
            user={user}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleTransactionDetailsSubmit}
            onBack={handleTransactionDetailsBack}
            comparisonStatus={comparisonStatus}
            comparisonError={comparisonError}
          />
        }
      />
      <Route
        path="/results"
        element={
          <ResultsScreen
            user={user}
            formData={formData}
            processors={mockProcessors}
            processorDiscounts={processorDiscounts}
            comparison={comparison}
            fetchLatestComparison={fetchLatestComparison}
            onRestart={handleRestart}
            onSeeDiscounts={() => navigate("/discounts")}
          />
        }
      />
      <Route
        path="/discounts"
        element={
          <DiscountsScreen
            user={user}
            formData={formData}
            processors={mockProcessors}
            processorDiscounts={processorDiscounts}
            comparison={comparison}
            fetchLatestComparison={fetchLatestComparison}
            onBack={() => navigate("/results")}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
