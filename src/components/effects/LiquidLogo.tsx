type LiquidLogoProps = { className?: string };

/** Displays the original FEUA logo without recoloring its official artwork. */
export function LiquidLogo({ className = "" }: LiquidLogoProps) {
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      <img
        src="/feua-logo.jpeg"
        alt=""
        className="h-full w-full object-contain"
      />
    </div>
  );
}
