export default function LoadingFallback({ message = "Loading celebration studio..." }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-tertiary-fixed/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* Emblem & Spinner */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="relative w-14 h-14 rounded-2xl bg-primary text-secondary-fixed flex items-center justify-center shadow-xl border border-secondary/30">
          <span className="material-symbols-outlined text-[28px] animate-spin-slow">auto_awesome</span>
          <div className="absolute -inset-1 rounded-2xl border-2 border-secondary/40 animate-ping pointer-events-none opacity-40"></div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="font-heading font-bold text-lg text-primary tracking-tight">
            Planora<span className="text-secondary">AI</span>
          </h2>
          <p className="font-body-md text-xs text-on-surface-variant font-medium">
            {message}
          </p>
        </div>

        {/* Shimmering Progress Capsule */}
        <div className="w-44 h-1.5 rounded-full bg-surface-container-high overflow-hidden relative mt-1">
          <div className="h-full bg-gradient-to-r from-secondary-fixed via-secondary to-secondary-fixed-dim rounded-full w-2/3 animate-[shimmer_1.5s_infinite_linear]"></div>
        </div>
      </div>
    </div>
  );
}
