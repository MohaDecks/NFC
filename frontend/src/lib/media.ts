export function mediaSrc(url: string | null | undefined, width = 1200) {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,c_fill,w_${width}/`);
  }
  return url;
}

export function fullAddress(location: { address?: string; city?: string; country?: string }) {
  return [location.address, location.city, location.country].filter(Boolean).join(", ");
}
