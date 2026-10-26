import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingFallback from "./components/common/LoadingFallback";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";

// Lazy-loaded studio layout (encapsulates EventProvider and Firestore dependencies)
const StudioLayout = lazy(() => import("./components/layout/StudioLayout"));

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
      <BrowserRouter>
        <RouteErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Protected Core Studio Pages wrapped in lazy StudioLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <StudioLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events" element={<MyEvents />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/event-details" element={<EventDetails />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/ai-ideas" element={<AiIdeas />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Convenience Redirect */}
              <Route path="/my-events" element={<Navigate to="/events" replace />} />
              <Route path="/create" element={<Navigate to="/create-event" replace />} />

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
    </AuthProvider>
  );
}
