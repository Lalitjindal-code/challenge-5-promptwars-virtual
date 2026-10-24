import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingFallback from "./components/common/LoadingFallback";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";

// Lazy-loaded page components for route-level code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyEvents = lazy(() => import("./pages/MyEvents"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Budget = lazy(() => import("./pages/Budget"));
const Timeline = lazy(() => import("./pages/Timeline"));
const Guests = lazy(() => import("./pages/Guests"));
const Vendors = lazy(() => import("./pages/Vendors"));
const AiIdeas = lazy(() => import("./pages/AiIdeas"));
const Settings = lazy(() => import("./pages/Settings"));
const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const AuthActionPage = lazy(() => import("./pages/auth/AuthActionPage"));

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <BrowserRouter>
          <RouteErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Protected Core Studio Pages */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <MyEvents />
                    </ProtectedRoute>
                  }
                />
                <Route path="/my-events" element={<Navigate to="/events" replace />} />
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoute>
                      <CreateEvent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/event-details"
                  element={
                    <ProtectedRoute>
                      <EventDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budget"
                  element={
                    <ProtectedRoute>
                      <Budget />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/timeline"
                  element={
                    <ProtectedRoute>
                      <Timeline />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guests"
                  element={
                    <ProtectedRoute>
                      <Guests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendors"
                  element={
                    <ProtectedRoute>
                      <Vendors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-ideas"
                  element={
                    <ProtectedRoute>
                      <AiIdeas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Authentication Gateway & Actions */}
                <Route path="/signin" element={<AuthPage initialTab="signin" />} />
                <Route path="/signup" element={<AuthPage initialTab="signup" />} />
                <Route path="/forgot-password" element={<AuthPage initialTab="forgot" />} />
                <Route path="/password-updated" element={<AuthPage initialTab="success" />} />
                <Route path="/auth/action" element={<AuthActionPage />} />
                <Route path="/reset-password" element={<AuthActionPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
      </EventProvider>
    </AuthProvider>
  );
}
