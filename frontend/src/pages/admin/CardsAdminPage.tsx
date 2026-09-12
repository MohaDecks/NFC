import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError, profileUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/hooks/useAdmin";
import type { AdminProfile } from "@/types";

type CardRow = {
  id: string;
  cardId: string;
  name: string;
  profileId: string;
  profileName: string;
  publicId: string;
  publicUrl: string;
  status: string;
  nfcEnabled: boolean;
  qrEnabled: boolean;
};

export function CardsAdminPage() {
  const { can } = useAdmin();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("Reception Card");
  const [status, setStatus] = useState("");

  async function load() {
    const query = status ? `?status=${status}` : "";
    const [cardData, profileData] = await Promise.all([
      api.get<{ cards: CardRow[] }>(`/api/admin/cards${query}`),
      api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50"),
    ]);
    setCards(cardData.cards);
    setProfiles(profileData.profiles);
    if (!profileId && profileData.profiles[0]) setProfileId(profileData.profiles[0].id);
  }
  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
  }, [status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Business Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registered digital business cards. One profile can have many physical cards. Each chip stores only the public URL.
        </p>
      </div>
      {can("nfc.manage") && (
        <form
          className="grid gap-3 rounded-[22px] border border-[#EEEFF3] bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await api.post("/api/admin/cards", { profileId, name });
              setName("Reception Card");
              toast.success("Card created");
              await load();
            } catch (err) {
              toast.error(friendlyError(err));
            }
          }}
        >
          <div className="space-y-2">
            <Label>Assign to profile</Label>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name || profile.publicId}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Card name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reception Card" />
          </div>
          <Button className="rounded-full bg-[#1565C0] hover:bg-[#0D47A1]">+ Create Card</Button>
        </form>
      )}
      <div className="flex gap-2">
        {["", "ACTIVE", "INACTIVE", "LOST", "REPLACED"].map((item) => (
          <Button key={item || "all"} size="sm" variant={status === item ? "default" : "outline"} onClick={() => setStatus(item)}>
            {item || "All"}
          </Button>
        ))}
      </div>
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Card</th>
              <th className="font-medium">Profile</th>
              <th className="font-medium">Public URL</th>
              <th className="font-medium">Status</th>
              <th className="pr-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-t border-[#F1F2F6]">
                <td className="px-5 py-3">
                  <p className="font-medium">{card.name}</p>
                  <p className="font-mono text-[11px] text-slate-400">{card.cardId}</p>
                </td>
                <td>
                  <Link to={`/admin/profiles/${card.profileId}`} className="text-[#1565C0]">{card.profileName || "Profile"}</Link>
                </td>
                <td className="font-mono text-[11px]">{card.publicId ? profileUrl(card.publicId) : card.publicUrl}</td>
                <td>{card.status}</td>
                <td className="pr-5 text-right">
                  {can("nfc.manage") && (
                    <>
                      <button className="mr-2 text-[#1565C0]" onClick={async () => { await api.patch(`/api/admin/cards/${card.id}`, { status: card.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }); await load(); }}>
                        {card.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button className="mr-2 text-[#1565C0]" onClick={async () => { await api.patch(`/api/admin/cards/${card.id}`, { status: "REPLACED" }); await load(); }}>Replace</button>
                      <button className="text-red-500" onClick={async () => { if (!window.confirm("Delete this card?")) return; await api.delete(`/api/admin/cards/${card.id}`); await load(); }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground">
                  No business cards yet. Register a card, or create a profile and add cards for reception, rooms, or staff.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
