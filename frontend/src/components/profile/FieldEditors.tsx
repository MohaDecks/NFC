import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OpeningHour, SocialLink } from "@/types";
import { SOCIAL_PLATFORMS, detectSocialKind } from "@/lib/social";
import { SOCIAL_COLORS, SocialBrandIcon } from "@/components/public/SocialBrandIcon";

const platforms = SOCIAL_PLATFORMS.map((item) => item.label);

export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHour[];
  onChange: (hours: OpeningHour[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((row, index) => (
        <div key={row.day} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
          <p className="text-sm">{row.day}</p>
          <Input
            type="time"
            value={row.open}
            disabled={row.closed}
            onChange={(e) => {
              const next = [...value];
              next[index] = { ...row, open: e.target.value };
              onChange(next);
            }}
          />
          <Input
            type="time"
            value={row.close}
            disabled={row.closed}
            onChange={(e) => {
              const next = [...value];
              next[index] = { ...row, close: e.target.value };
              onChange(next);
            }}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={row.closed}
              onChange={(e) => {
                const next = [...value];
                next[index] = { ...row, closed: e.target.checked };
                onChange(next);
              }}
            />
            Closed
          </label>
        </div>
      ))}
    </div>
  );
}

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  const [platform, setPlatform] = useState("Instagram");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="space-y-3">
      {value.map((link, index) => (
        <div key={`${link.platform}-${index}`} className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-white"
            style={{
              background: SOCIAL_COLORS[detectSocialKind(link.platform, link.url)],
              color: detectSocialKind(link.platform, link.url) === "snapchat" ? "#111827" : "#fff",
            }}
          >
            <SocialBrandIcon kind={detectSocialKind(link.platform, link.url)} className="h-4 w-4" />
          </span>
          <span className="w-24 text-sm">{link.platform}</span>
          <Input value={link.username ? `@${link.username}` : link.url} readOnly className="flex-1" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="grid gap-2 sm:grid-cols-[140px_1fr_140px_auto]">
        <select
          className="h-10 rounded-md border border-input bg-background px-2 text-sm"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {platforms.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Input placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!url.trim()) return;
            onChange([...value, { platform, url: url.trim(), username: username.trim() || undefined }]);
            setUrl("");
            setUsername("");
          }}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const next = draft.trim();
    if (!next || value.includes(next)) return;
    onChange([...value, next]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((item) => item !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}
