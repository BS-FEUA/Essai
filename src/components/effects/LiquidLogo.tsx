type LiquidLogoProps = { className?: string };

/** Displays the original FEUA logo without recoloring its official artwork. */
export function LiquidLogo({ className = "" }: LiquidLogoProps) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl border border-amber-300/70 bg-white/55 p-2 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-700/15 backdrop-blur-md dark:border-amber-300/25 dark:bg-slate-900/30 dark:ring-white/10 ${className}`}
      aria-hidden="true"
    >
      <img
        src="/feua-logo-transparent.png"
        alt=""
        className="h-full w-full object-contain"
      />
    </div>
  );
}
