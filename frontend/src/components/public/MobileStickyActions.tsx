import { MessageCircle, Phone } from "lucide-react";
import type { PublicProfile } from "@/types";
import { whatsappLink } from "@/lib/utils";

export function MobileStickyActions({ profile }: { profile: PublicProfile }) {
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  if (!phone && !wa) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 text-sm font-semibold text-white"
            style={{ background: "var(--p)", borderRadius: "var(--btn-radius)" }}
          >
            <Phone className="h-4 w-4" /> Call
          </a>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 text-sm font-semibold"
            style={{
              background: "color-mix(in oklab, var(--p) 12%, transparent)",
              color: "var(--p)",
              borderRadius: "var(--btn-radius)",
            }}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
