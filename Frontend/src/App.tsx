import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import HomePage from "./pages/HomePage";
import SeriesPage from "./pages/SeriesPage";
import EpisodeBuilder from "./pages/EpisodeBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);

  // 🔁 LOAD USER
  useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🔐 AUTH HANDLER
  const handleAuth = (userData: any) => {
    localStorage.setItem("current_user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token || "guest-token");
    setUser(userData);
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("current_user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔒 BASIC PROTECTION
  const ProtectedRoute = ({ children }: any) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // 🚫 GUEST RESTRICTION (MAIN LOGIC)
  const GuestRestrictedRoute = ({ children }: any) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }

    if (user?.guest) {
      return <Navigate to="/home" replace />;
    }

    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* 🔐 AUTH */}
          <Route
            path="/"
            element={<AuthScreen onAuth={handleAuth} />}
          />

          {/* 🏠 HOME */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage user={user} />
              </ProtectedRoute>
            }
          />

          {/* ❌ SERIES (BLOCK GUEST) */}
          <Route
            path="/series"
            element={
              <GuestRestrictedRoute>
                <SeriesPage user={user} />
              </GuestRestrictedRoute>
            }
          />

          {/* ❌ EPISODE BUILDER (BLOCK GUEST) */}
          <Route
            path="/episode-builder"
            element={
              <GuestRestrictedRoute>
                <EpisodeBuilder user={user} />
              </GuestRestrictedRoute>
            }
          />

          {/* ✅ DASHBOARD (ALLOWED FOR GUEST) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onLogout={handleLogout} user={user} />
              </ProtectedRoute>
            }
          />

          {/* ❌ NOT FOUND */}
          <Route path="/not-found" element={<NotFound />} />

          {/* 🔁 AUTO REDIRECT */}
          <Route
            path="*"
            element={
              user
                ? <Navigate to="/home" replace />
                : <Navigate to="/" replace />
            }
          />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;