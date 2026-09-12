import { useBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  imgClassName,
  showText = false,
  compact = false,
}: {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  compact?: boolean;
}) {
  const { brandName, logoUrl, tagline } = useBranding();
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img src={logoUrl} alt={brandName} className={cn("h-10 w-auto object-contain", imgClassName)} />
      {showText && (
        <div className="min-w-0">
          <p className={cn("font-semibold leading-tight tracking-tight", compact ? "text-[12px]" : "text-[13px]")}>
            {compact ? "MUBAREK" : brandName}
          </p>
          <p className="mt-0.5 text-[10px] text-current/50">{compact ? "TECHNOLOGY SOLUTION" : tagline}</p>
        </div>
      )}
    </div>
  );
}
