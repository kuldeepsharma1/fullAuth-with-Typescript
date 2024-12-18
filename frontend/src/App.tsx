import { Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "@/components/ui/toaster";
import VerificationEmailPage from "./pages/VerificationEmailPage";
import { useAuthStore } from "./store/authStore";
import { useEffect, ReactNode } from "react";
import DashboardPage from "./pages/DashboardPage";
import { Button } from "./components/ui/button";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import GuestPage from "./pages/Guest";

interface ProtectRouteProps {
  children: ReactNode;
}

const ProtectRoute: React.FC<ProtectRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AuthenticatedUserRoute: React.FC<ProtectRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isCheckingAuth, checkAuth, logout, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
  };

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user && <Button onClick={handleLogout}>Logout</Button>}
      <Routes>
        <Route path="/" element={<GuestPage />} />
        <Route
          path="/signup"
          element={
            <AuthenticatedUserRoute>
              <SignUpPage />
            </AuthenticatedUserRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthenticatedUserRoute>
              <LoginPage />
            </AuthenticatedUserRoute>
          }
        />
        <Route path="/verify-email" element={<VerificationEmailPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/forgot-password"
          element={
            <AuthenticatedUserRoute>
              <ForgotPasswordPage />
            </AuthenticatedUserRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectRoute>
              <DashboardPage />
            </ProtectRoute>
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
