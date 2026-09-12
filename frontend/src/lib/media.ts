export function mediaSrc(
  url: string | null | undefined,
  width = 1200,
  mode: "limit" | "fill" = "limit",
) {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const crop = mode === "fill" ? "c_fill,g_auto" : "c_limit";
    return url.replace("/upload/", `/upload/f_auto,q_auto,${crop},w_${width}/`);
  }
  if (url.startsWith("/uploads/") && typeof window !== "undefined") {
    return `${window.location.origin}${url}`;
  }
  return url;
}

export function fullAddress(location: { address?: string; city?: string; country?: string }) {
  return [location.address, location.city, location.country].filter(Boolean).join(", ");
}
