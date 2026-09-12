import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/profile/ImageUpload";
import type { ContentItem } from "@/lib/sectionContent";

function update(items: ContentItem[], index: number, patch: Partial<ContentItem>, onChange: (items: ContentItem[]) => void) {
  const next = items.slice();
  next[index] = { ...items[index], ...patch };
  onChange(next);
}

export function SkillsEditor({
  items,
  onChange,
  onSave,
}: {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Add skills as chips. Empty skills are hidden on the public page.</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1 rounded-full border bg-white px-2 py-1">
            <Input
              className="h-8 w-32 border-0 bg-transparent px-1"
              value={item.title ?? ""}
              placeholder="React"
              onChange={(e) => update(items, index, { title: e.target.value }, onChange)}
            />
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => onChange([...items, { title: "" }])}>
          <Plus className="mr-1 h-4 w-4" /> Add skill
        </Button>
        <Button type="button" onClick={onSave}>Save skills</Button>
      </div>
    </div>
  );
}

export function ProjectsEditor({
  items,
  profileId,
  onChange,
  onSave,
}: {
  items: ContentItem[];
  profileId: string;
  onChange: (items: ContentItem[]) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-2xl border bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project title" value={item.title ?? ""} onChange={(title) => update(items, index, { title }, onChange)} />
            <Field label="Category" value={item.category ?? ""} onChange={(category) => update(items, index, { category }, onChange)} />
            <Field label="Project URL" value={item.url ?? ""} onChange={(url) => update(items, index, { url }, onChange)} />
            <Field label="GitHub URL" value={item.github ?? ""} onChange={(github) => update(items, index, { github }, onChange)} />
            <div className="sm:col-span-2">
              <Field label="Technologies" value={item.technologies ?? ""} onChange={(technologies) => update(items, index, { technologies }, onChange)} placeholder="React, Node.js, MongoDB" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={item.text ?? ""} onChange={(e) => update(items, index, { text: e.target.value }, onChange)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(item.featured)}
              onChange={(e) => update(items, index, { featured: e.target.checked }, onChange)}
            />
            Featured project
          </label>
          <ImageUpload
            label="Project image"
            kind="gallery"
            profileId={profileId}
            previewUrl={item.image}
            onChange={(media) => update(items, index, { image: media?.url ?? "" }, onChange)}
          />
          <Button type="button" variant="ghost" className="text-red-600" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            Remove project
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => onChange([...items, { title: "", featured: false }])}>
          <Plus className="mr-1 h-4 w-4" /> Add project
        </Button>
        <Button type="button" onClick={onSave}>Save projects</Button>
      </div>
    </div>
  );
}

export function ExperienceEditor({
  items,
  onChange,
  onSave,
}: {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2">
          <Field label="Position" value={item.title ?? ""} onChange={(title) => update(items, index, { title }, onChange)} />
          <Field label="Company" value={item.company ?? ""} onChange={(company) => update(items, index, { company }, onChange)} />
          <Field label="Start" value={item.startDate ?? ""} onChange={(startDate) => update(items, index, { startDate }, onChange)} placeholder="2024" />
          <Field label="End" value={item.endDate ?? ""} onChange={(endDate) => update(items, index, { endDate }, onChange)} placeholder="Present" />
          <Field label="Location" value={item.location ?? ""} onChange={(location) => update(items, index, { location }, onChange)} />
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea className="mt-2" value={item.text ?? ""} onChange={(e) => update(items, index, { text: e.target.value }, onChange)} />
          </div>
          <Button type="button" variant="ghost" className="text-red-600" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => onChange([...items, {}])}>
          <Plus className="mr-1 h-4 w-4" /> Add experience
        </Button>
        <Button type="button" onClick={onSave}>Save experience</Button>
      </div>
    </div>
  );
}

export function CredentialEditor({
  items,
  onChange,
  onSave,
  label,
}: {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  onSave: () => void;
  label: string;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2">
          <Field label="Title" value={item.title ?? ""} onChange={(title) => update(items, index, { title }, onChange)} />
          <Field label="Details" value={item.text ?? ""} onChange={(text) => update(items, index, { text }, onChange)} />
          <Field label="Start" value={item.startDate ?? ""} onChange={(startDate) => update(items, index, { startDate }, onChange)} />
          <Field label="End / year" value={item.endDate ?? ""} onChange={(endDate) => update(items, index, { endDate }, onChange)} />
          <Button type="button" variant="ghost" className="text-red-600" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => onChange([...items, {}])}>
          <Plus className="mr-1 h-4 w-4" /> Add {label.toLowerCase()}
        </Button>
        <Button type="button" onClick={onSave}>Save {label.toLowerCase()}</Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
