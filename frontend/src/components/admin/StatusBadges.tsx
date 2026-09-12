import { Badge } from "@/components/ui/badge";
import type { ProfileStatus, PublishState } from "@shared/profileTypes";

export function StatusBadge({ status }: { status: ProfileStatus }) {
  if (status === "ACTIVE") return <Badge variant="success">Active</Badge>;
  if (status === "BLOCKED") return <Badge className="border-transparent bg-red-100 text-red-800">Blocked</Badge>;
  return <Badge variant="warning">Inactive</Badge>;
}

export function PublishBadge({ state }: { state?: PublishState }) {
  return state === "PUBLISHED" ? <Badge variant="success">Published</Badge> : <Badge variant="secondary">Draft</Badge>;
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? <Badge variant="success">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>;
}
