import { fullAddress } from "./media";

export function isRealAddress(address: string) {
  const compact = address.replace(/[,\s.]/g, "");
  if (compact.length < 6) return false;
  if (/^[eE]+$/.test(compact)) return false;
  return true;
}

export function realAddress(location: { address?: string; city?: string; country?: string }) {
  const address = fullAddress(location);
  return isRealAddress(address) ? address : "";
}
