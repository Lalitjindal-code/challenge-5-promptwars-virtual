import { useState, useEffect, type FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../../lib/firebase";

export default function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [isLoading, setIsLoading] = useState(true);
  const [accountEmail, setAccountEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [emailVerifiedSuccess, setEmailVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (!oobCode || !mode) {
      setError("Invalid or expired security link. Please request a new link.");
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !auth) {
      setError("Firebase Authentication is not configured.");
      setIsLoading(false);
      return;
    }

    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setAccountEmail(email);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Code verification failed:", err);
          setError("This password reset link has expired or has already been used. Please request a new one.");
          setIsLoading(false);
        });
    } else if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setEmailVerifiedSuccess(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Email verification failed:", err);
          setError("Email verification link is invalid or has expired.");
          setIsLoading(false);
        });
    } else {
      setError(`Unsupported security action: ${mode}`);
      setIsLoading(false);
    }
  }, [mode, oobCode]);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!auth || !oobCode) return;

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setIsCompleted(true);
    } catch (err: any) {
      console.error("Password reset confirmation error:", err);
      setError(err?.message?.replace("Firebase: ", "") || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">auto_awesome</span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-primary">
              Planora <span className="text-secondary">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Identity Sentinel
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-on-surface-variant">Validating security token...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[24px]">error_outline</span>
              </div>
              <h2 className="font-heading font-bold text-xl text-primary mb-2">Security Verification Failed</h2>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">{error}</p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all"
              >
                Request a New Reset Link
              </Link>
            </div>
          ) : emailVerifiedSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
              <h2 className="font-heading font-bold text-2xl text-primary mb-2">Email Verified Successfully</h2>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                Your email address has been verified. You can now access your full event studio and collaborative tools.
              </p>
              <Link
                to="/dashboard"
                className="w-full inline-flex items-center justify-center h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all"
              >
                Enter Event Studio →
              </Link>
            </div>
          ) : isCompleted ? (
            /* Stitch Screen 14: Auth password updated.html */
            <div className="w-full flex flex-col items-center text-center animate-fade-in">
              <div className="w-full h-1 bg-gradient-to-r from-secondary-container via-secondary to-on-tertiary-container rounded-full mb-6"></div>

              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500/20 flex items-center justify-center shadow-lg relative">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-[32px]">check_circle</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-secondary-fixed flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Security Protocol Complete</span>
              </div>

              <h2 className="font-heading font-bold text-2xl text-primary tracking-tight mb-2">
                Password Updated Successfully
              </h2>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 max-w-sm">
                Your credentials for <strong>{accountEmail}</strong> have been updated securely across all Planora AI nodes.
              </p>

              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 mb-4"
              >
                <span>Sign In with New Password</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-wider mb-2">
                  <span>Cryptographic Key Reset</span>
                </div>
                <h2 className="font-heading font-bold text-2xl text-primary">Set New Password</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Choose a new password for <strong>{accountEmail}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Updating Password..." : "Update Password & Secure Account"}</span>
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-outline-variant/10 bg-surface/50 text-[11px] text-on-surface-variant">
        Planora AI Security &copy; 2026. Enterprise cryptographic credential authentication.
      </footer>
    </div>
  );
}
