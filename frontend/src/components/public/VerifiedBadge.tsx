import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
      style={{ background: "color-mix(in oklab, var(--p) 16%, white)", color: "var(--p)" }}
    >
      <BadgeCheck className="h-4 w-4" />
      Verified
    </span>
  );
}
