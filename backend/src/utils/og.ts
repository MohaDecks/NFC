import fs from "node:fs/promises";
import type { Request, Response } from "express";
import { Profile } from "../models/Profile";
import { routeParam } from "./params";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendPublicHtml(req: Request, res: Response, indexPath: string) {
  const html = await fs.readFile(indexPath, "utf8");
  const profile = await Profile.findOne({
    publicId: routeParam(req, "publicId"),
    status: "ACTIVE",
  }).populate("cover logo avatar");

  if (!profile) {
    res.send(html);
    return;
  }

  const title = escapeHtml(profile.name || "Digital profile");
  const description = escapeHtml(
    (profile.description || `${profile.name} · Digital profile`).slice(0, 160),
  );
  const imageDoc = profile.cover || profile.logo || profile.avatar;
  const imageUrl =
    imageDoc && typeof imageDoc === "object" && "url" in imageDoc
      ? String((imageDoc as { url: string }).url)
      : "";
  const absoluteImage = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${req.protocol}://${req.get("host")}${imageUrl}`
    : "";

  const tags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    ${absoluteImage ? `<meta property="og:image" content="${escapeHtml(absoluteImage)}" />` : ""}
    <meta property="og:type" content="website" />
  `;

  res.send(html.replace("</head>", `${tags}</head>`));
}

