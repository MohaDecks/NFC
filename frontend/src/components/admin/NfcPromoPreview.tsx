import { FlipNfcCard } from "@/components/admin/FlipNfcCard";
import { useBranding } from "@/hooks/useBranding";

export function HeroNfcCards() {
  const { brandName } = useBranding();
  return (
    <div className="relative h-[150px] w-[270px]">
      <div className="absolute right-0 top-0 origin-center rotate-[8deg]">
        <FlipNfcCard
          width={148}
          title={brandName}
          design={{ backgroundColor: "#FFFFFF", primaryColor: "#0F172A", accentColor: "#1565C0", frontText: "Scan or Tap", backText: "Scan or Tap" }}
        />
      </div>
      <div className="absolute left-0 top-8 origin-center -rotate-[8deg]">
        <FlipNfcCard
          width={168}
          title={brandName}
          design={{ backgroundColor: "#0B1020", primaryColor: "#F8FAFC", accentColor: "#38BDF8", frontText: "Digital Business Card" }}
        />
      </div>
    </div>
  );
}

export function NfcPromoPreview() {
  const { brandName } = useBranding();
  return (
    <div className="relative mx-auto h-[250px] w-full max-w-[460px]">
      <div className="absolute right-6 top-10 h-40 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="absolute right-2 top-2 origin-center rotate-[10deg]">
        <FlipNfcCard
          width={228}
          title={brandName}
          design={{ backgroundColor: "#FFFFFF", primaryColor: "#0F172A", accentColor: "#1565C0", backText: "Scan or Tap" }}
        />
      </div>
      <div className="absolute left-0 top-8 origin-center -rotate-[8deg]">
        <FlipNfcCard
          title={brandName}
          design={{ backgroundColor: "#0B1020", primaryColor: "#F8FAFC", accentColor: "#38BDF8", frontText: "Digital Business Card" }}
        />
      </div>
    </div>
  );
}
