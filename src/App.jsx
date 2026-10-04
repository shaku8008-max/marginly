/**
 * Main App component for Marginly.
 * Handles routing, lifts state up for form data and authenticated user,
 * and protects routes that require a logged-in user.
 */
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import BusinessProfileScreen from "./screens/BusinessProfileScreen";
import TransactionDetailsScreen from "./screens/TransactionDetailsScreen";
import ResultsScreen from "./screens/ResultsScreen";
import DiscountsScreen from "./screens/DiscountsScreen";
import { mockProcessors } from "./data/mockProcessors";
import { generateRandomDiscounts } from "./utils/generateDiscounts";
import supabase from "./services/supabaseClient";

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

  // Generate random discount percentages once per session and store in state.
  // This is stored here (not inside DiscountsScreen) so the values stay stable
  // across re-renders and back-and-forth navigation between Results and Discounts.
  const [processorDiscounts] = useState(() => generateRandomDiscounts(mockProcessors));

  // List of routes that require an authenticated user
  const protectedPaths = ["/business-profile", "/transaction-details", "/results", "/discounts"];
  const isProtectedRoute = protectedPaths.includes(location.pathname);

  // If the user is not logged in and tries to access a protected route,
  // redirect them to the login screen
  if (!user && isProtectedRoute) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (userData) => {
    // Store the Supabase user object (contains user.id, user.email, etc.)
    // so child screens can use user.id for saving data to Supabase.
    setUser(userData);
    navigate("/business-profile");
  };

  // signOut clears the local session and revokes the refresh token on the server.
  // After calling this, supabase.auth.getSession() will return null.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const handleBusinessProfileNext = () => {
    navigate("/transaction-details");
  };

  const handleTransactionDetailsBack = () => {
    navigate("/business-profile");
  };

  const handleTransactionDetailsNext = () => {
    navigate("/results");
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
            onNext={handleTransactionDetailsNext}
            onBack={handleTransactionDetailsBack}
          />
        }
      />
      {/* Props pattern: formData and processorDiscounts are lifted to App.jsx
          and passed down as props to child screens — the same pattern used for formData */}
      <Route
        path="/results"
        element={
          <ResultsScreen
            user={user}
            formData={formData}
            processors={mockProcessors}
            processorDiscounts={processorDiscounts}
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
