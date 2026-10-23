import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AuthPageProps {
  initialTab?: "signin" | "signup" | "forgot" | "dispatched" | "success";
}

export default function AuthPage({ initialTab = "signin" }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isConfigured, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, enterDemoWorkspace } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup" | "forgot" | "dispatched" | "success">(initialTab);
  const [showDevices, setShowDevices] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  if (user && tab !== "success" && tab !== "dispatched") {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (tab === "signin") {
        await signInWithEmail(email, password);
        navigate(from, { replace: true });
      } else if (tab === "signup") {
        await signUpWithEmail(email, password, name);
        navigate(from, { replace: true });
      } else if (tab === "forgot") {
        await resetPassword(email);
        setTab("dispatched");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message?.replace("Firebase: ", "") || "Authentication failed. Please check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message?.replace("Firebase: ", "") || "Google sign-in failed.");
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
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isConfigured
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {isConfigured ? "Firebase Cloud Live" : "Demo Mode (Mock Auth)"}
            </span>
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider">256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Stage */}
      <main className="flex-1 w-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Tab Selector Pill */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                Account Gateway
              </span>
            </div>
            <div className="inline-flex p-1 bg-surface-container rounded-xl gap-1">
              <button
                type="button"
                onClick={() => { setTab("signin"); setError(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === "signin"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab("signup"); setError(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === "signup"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setTab("forgot"); setError(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === "forgot" || tab === "success"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Forgot Password
              </button>
            </div>
          </div>

          {/* Split Stage Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-xl bg-surface-container-lowest border border-outline-variant/15">
            {/* Left Editorial Visual */}
            <div className="lg:col-span-7 relative min-h-[460px] lg:min-h-[600px] flex flex-col justify-between p-8 md:p-12 text-white bg-gradient-to-br from-primary via-primary-container to-surface-tint">
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">auto_awesome</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold">Planora AI Studio</span>
                </div>

                <div className="space-y-2 max-w-lg">
                  <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                    Every great celebration starts with a plan.
                  </h1>
                  <p className="text-xs md:text-sm text-primary-fixed-dim leading-relaxed">
                    Bring your ideas together, organize every detail, and create unforgettable moments with Planora AI.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full max-w-sm pt-2">
                  {[
                    { icon: "event_available", text: "Plan every detail in one place" },
                    { icon: "shield_with_heart", text: "Keep your budget under control" },
                    { icon: "magic_button", text: "Turn ideas into memorable experiences" }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-secondary-fixed">{feat.icon}</span>
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-4 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl mt-4">
                <span className="material-symbols-outlined text-secondary-fixed text-[24px]">verified</span>
                <p className="text-[11px] text-primary-fixed-dim leading-snug">
                  Trusted by <strong>12,000+ luxury event planners</strong> across premier weddings and private galas.
                </p>
              </div>
            </div>

            {/* Right Interactive Form Container */}
            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In State */}
              {tab === "signin" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-primary">Welcome back</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Sign in to manage your active events and studio.</p>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Or with Email</span>
                    <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@planora.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-on-surface uppercase">Password</label>
                      <button
                        type="button"
                        onClick={() => { setTab("forgot"); setError(""); }}
                        className="text-xs text-secondary hover:underline font-semibold"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Authenticating..." : "Sign In to Studio"}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>

                  <div className="text-center text-xs text-on-surface-variant pt-2">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("signup"); setError(""); }}
                      className="text-secondary font-bold hover:underline"
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Explore Demo Workspace CTA */}
                  <div className="pt-3 border-t border-outline-variant/20 flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        enterDemoWorkspace();
                        navigate("/dashboard");
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-secondary-container/40 hover:bg-secondary-container/70 border border-secondary/30 text-primary text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
                      <span>Explore Demo Studio (Pre-loaded Portfolio)</span>
                    </button>
                    <span className="text-[11px] text-on-surface-variant">
                      Preview complete luxury event workflows without credentials
                    </span>
                  </div>
                </form>
              )}

              {/* Sign Up State */}
              {tab === "signup" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-primary">Create Your Studio</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Start organizing thoughtful events with AI assistance.</p>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>

                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Or with Email</span>
                    <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@planora.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1">Password (Min 6 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Choose a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Creating Account..." : "Create Studio Account"}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>

                  <div className="text-center text-xs text-on-surface-variant pt-2">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("signin"); setError(""); }}
                      className="text-secondary font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Forgot Password State */}
              {tab === "forgot" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-primary">Reset Password</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Enter your registered email to receive recovery instructions.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@planora.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Reset Link"}</span>
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                  </button>

                  <div className="text-center text-xs text-on-surface-variant pt-2">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("signin"); setError(""); }}
                      className="text-secondary font-bold hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Instructions Dispatched State */}
              {tab === "dispatched" && (
                <div className="w-full flex flex-col items-center text-center animate-fade-in pt-2">
                  <div className="w-16 h-16 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary mb-4 border border-secondary/30">
                    <span className="material-symbols-outlined text-[32px]">forward_to_inbox</span>
                  </div>

                  <span className="font-caption text-caption uppercase tracking-wider text-secondary font-semibold">
                    Recovery Link Dispatched
                  </span>
                  <h2 className="font-heading font-bold text-2xl text-primary tracking-tight mt-1 mb-2">
                    Check your inbox
                  </h2>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed max-w-sm mb-6">
                    We dispatched secure recovery instructions to <strong>{email}</strong>. Please click the security link in your email to choose a new password.
                  </p>

                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/15 text-xs text-on-surface-variant text-left mb-6 w-full">
                    <p className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">info</span>
                      <span>If you don't receive the email within 2 minutes, check your spam or promotional folder.</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setTab("signin"); setError(""); }}
                    className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Return to Sign In</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* Reset Sent / Password Updated Confirmation State (Matching Stitch Auth password updated.html) */}
              {tab === "success" && (
                <div className="w-full flex flex-col items-center text-center relative overflow-hidden animate-fade-in pt-2">
                  {/* Subtle Gilded Accent Strip */}
                  <div className="w-full h-1 bg-gradient-to-r from-secondary-container via-secondary to-on-tertiary-container rounded-full mb-6"></div>

                  {/* Circular Green & Gold Shield / Checkmark Badge */}
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -inset-2 rounded-full bg-secondary-container/30 blur-md animate-pulse"></div>
                    <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center shadow-inner relative z-10">
                      <div className="w-14 h-14 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[32px]">check_circle</span>
                      </div>
                    </div>
                    {/* Floater Gold Sparkle */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-primary shadow-sm z-20">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    </div>
                    {/* Floater Violet Sentinel Node */}
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container shadow-sm z-20">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                    </div>
                  </div>

                  {/* Main Typography Stack */}
                  <div className="flex flex-col items-center gap-1 max-w-md">
                    <span className="font-caption text-caption uppercase tracking-wider text-secondary font-semibold">
                      Security Protocol Complete
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                      Password updated
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                      Your password recovery instructions have been dispatched. Your active sessions are secured and you can now return to sign in.
                    </p>
                  </div>

                  {/* Security Audit Metadata Pill */}
                  <div className="mt-4 w-full bg-surface-container-low py-2.5 px-3 rounded-lg flex items-center justify-between text-left border border-outline-variant/15">
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">Dispatched just now</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span className="font-caption text-caption text-on-surface-variant font-medium">Planora Sentinel 2FA Active</span>
                    </div>
                  </div>

                  {/* Action Station */}
                  <div className="w-full mt-6 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTab("signin")}
                      className="w-full h-12 bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary rounded-lg font-title-md text-title-md flex items-center justify-center gap-2 shadow-sm transition-all group"
                    >
                      <span>Continue to Sign In</span>
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDevices(!showDevices)}
                      className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md-medium text-body-md flex items-center justify-center gap-2 transition-colors border border-outline-variant/15"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary-container">devices</span>
                      <span>{showDevices ? "Hide authorized devices" : "Review active authorized devices (3)"}</span>
                    </button>
                  </div>

                  {/* Expandable Device Inspection Drawer */}
                  {showDevices && (
                    <div className="w-full mt-2 flex flex-col gap-2 p-3 rounded-lg bg-surface-container-low text-left border border-outline-variant/15 animate-fade-in">
                      <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant pb-1">
                        <span className="font-semibold uppercase tracking-wider">Authorized Sessions</span>
                        <span className="text-secondary font-medium">All Other Sessions Revoked</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-container-lowest border border-outline-variant/10">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">laptop_mac</span>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold">MacBook Pro 16″ • Florence, IT</span>
                            <span className="font-caption text-caption text-on-surface-variant">Current device • Chrome 124</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-caption font-caption font-semibold">
                          Current
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-container-lowest border border-outline-variant/10">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">phone_iphone</span>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold">iPhone 15 Pro Max • Milan, IT</span>
                            <span className="font-caption text-caption text-on-surface-variant">Planora Concierge App • 4m ago</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                      </div>
                    </div>
                  )}

                  {/* Enterprise Guarantee Footer */}
                  <div className="w-full mt-6 pt-4 border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-1 text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                      <span className="font-caption text-caption uppercase tracking-wider font-semibold">Planora Enterprise Vault</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span className="font-caption text-caption">SOC-2 Type II Certified</span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-caption text-caption">TLS 1.3 Strict</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low/50 py-4 border-t border-outline-variant/10 text-xs text-on-surface-variant text-center">
        © 2026 Planora AI Studio. All rights reserved.
      </footer>
    </div>
  );
}
