import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { PublicProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanArrival } from "@/components/public/ScanArrival";

const ProfileRenderer = lazy(() =>
  import("@/components/templates/registry").then((module) => ({ default: module.ProfileRenderer })),
);

export function PublicProfilePage() {
  const { publicId } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicId) return;
    setLoading(true);
    api
      .get<{ profile: PublicProfile }>(`/api/public/profiles/${publicId}`)
      .then((data) => {
        setProfile(data.profile);
        setError("");
      })
      .catch((err: Error) => {
        setProfile(null);
        setError(err.message || "Profile unavailable.");
      })
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee]">
        <Skeleton className="h-[68vh] w-full rounded-none" />
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="mt-4 h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6 text-center">
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">MUBAREK TECHNOLOGY SOLUTION</p>
          <h1 className="mt-3 font-serif text-4xl">Profile currently unavailable</h1>
          <p className="mt-3 text-muted-foreground">This presence is inactive, blocked, or does not exist.</p>
        </div>
      </div>
    );
  }

  const title = profile.name || "Digital profile";
  const description =
    profile.description?.slice(0, 160) ||
    (profile.type === "RESTAURANT" || profile.type === "CAFETERIA"
      ? `${profile.name} · Digital menu & website`
      : `${profile.name} · Digital presence`);
  const image = profile.media.coverUrl || profile.media.logoUrl || profile.media.avatarUrl || "";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image.startsWith("http") ? image : `${window.location.origin}${image}`} />}
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-white">
        <ScanArrival profile={profile} />
        <Suspense fallback={<Skeleton className="h-screen w-full rounded-none" />}>
          <ProfileRenderer profile={profile} template={profile.design.template} fullPage />
        </Suspense>
      </div>
    </>
  );
}
