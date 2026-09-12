import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowUpRight,
  BadgeCheck,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
} from "lucide-react";
import type { PublicProfile } from "@/types";
import { collectSocials } from "@/lib/collectSocials";
import { mediaSrc } from "@/lib/media";
import { itemsOf, sectionOf, techList } from "@/lib/sectionContent";
import { realAddress } from "@/lib/location";
import { buildVCard, downloadTextFile, mapsEmbedSrc, mapsLink, profileUrl, websiteLink, whatsappLink } from "@/lib/utils";
import { SOCIAL_COLORS, SocialBrandIcon } from "./SocialBrandIcon";
import { LocationSection } from "./LocationSection";

export function PersonalPortfolio({ profile }: { profile: PublicProfile }) {
  const accent = profile.design.primaryColor || "#6D28D9";
  const name = profile.name?.trim() || "Portfolio";
  const title = profile.tagline?.trim() || "";
  const about = profile.description?.trim() || "";
  const photo = profile.media.avatarUrl || profile.media.logoUrl;
  const cover = profile.media.coverUrl;
  const socials = collectSocials(profile);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const email = profile.contact.email;
  const site = websiteLink(profile.contact.website);
  const address = realAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const embed = mapsEmbedSrc(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const url = typeof window !== "undefined" ? profileUrl(profile.publicId) : `/p/${profile.publicId}`;

  const skills = itemsOf(sectionOf(profile, "skills"));
  const projects = itemsOf(sectionOf(profile, "portfolio"));
  const experience = itemsOf(sectionOf(profile, "experience"));
  const education = itemsOf(sectionOf(profile, "education"));
  const certs = itemsOf(sectionOf(profile, "certifications"));
  const services = profile.services;
  const gallery = profile.media.gallery;
  const featured = projects.filter((item) => item.featured);
  const restProjects = projects.filter((item) => !item.featured);
  const orderedProjects = [...featured, ...restProjects];

  const [copied, setCopied] = useState(false);

  function saveContact() {
    downloadTextFile(`${name}.vcf`, buildVCard(profile), "text/vcard");
  }

  async function shareProfile() {
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: title || name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[#F7F6F3] text-[#111111]">
      <header className="relative overflow-hidden bg-[#111111] text-white">
        {cover && (
          <img src={mediaSrc(cover, 1800, "fill")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.25)_0%,rgba(17,17,17,0.88)_78%)]" />
        <div className="relative mx-auto w-full max-w-[1180px] px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] md:px-8 md:pb-14 md:pt-16">
          <div className="public-in flex flex-col gap-8 md:flex-row md:items-end md:gap-12">
            <div className="shrink-0">
              {photo ? (
                <img
                  src={mediaSrc(photo, 720)}
                  alt={name}
                  className="h-44 w-44 rounded-[28px] object-cover shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-4 ring-white/15 sm:h-52 sm:w-52 md:h-60 md:w-60"
                />
              ) : (
                <div
                  className="flex h-44 w-44 items-center justify-center rounded-[28px] text-5xl font-semibold ring-4 ring-white/15 sm:h-52 sm:w-52 md:h-60 md:w-60"
                  style={{ background: accent }}
                >
                  {name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[34px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">{name}</h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              {title && <p className="mt-3 text-lg text-white/78 md:text-xl">{title}</p>}
              {address && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/55">
                  <MapPin className="h-3.5 w-3.5" />
                  {address}
                </p>
              )}
              {about && <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/72 md:text-base md:leading-8">{about}</p>}
              {socials.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {socials.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5"
                      style={{ background: SOCIAL_COLORS[link.kind] }}
                    >
                      <SocialBrandIcon kind={link.kind} className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveContact}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white"
                  style={{ background: accent }}
                >
                  <Download className="h-4 w-4" />
                  Save contact
                </button>
                <button
                  type="button"
                  onClick={() => void shareProfile()}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold text-white ring-1 ring-white/15"
                >
                  {copied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Copied" : "Share"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 md:px-8 md:py-12">
        <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
          {phone && <Action href={`tel:${phone}`} icon={Phone} label="Call" accent={accent} />}
          {wa && <Action href={wa} icon={MessageCircle} label="WhatsApp" accent={accent} />}
          {email && <Action href={`mailto:${email}`} icon={Mail} label="Email" accent={accent} />}
          {site && <Action href={site} icon={Globe} label="Website" accent={accent} />}
          {maps && <Action href={maps} icon={Navigation} label="Directions" accent={accent} />}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-start">
          <div className="space-y-8">
            {about && (
              <section id="about" className="public-in rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)] md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">About</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">The work behind the name</h2>
                <p className="mt-4 whitespace-pre-line text-[16px] leading-8 text-[#4B5563]">{about}</p>
              </section>
            )}

            {orderedProjects.length > 0 && (
              <section id="portfolio" className="public-in space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Selected work</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Projects</h2>
                </div>
                <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible">
                  {orderedProjects.map((project, index) => {
                    const href = project.url ? websiteLink(project.url) : undefined;
                    const github = project.github ? websiteLink(project.github) : undefined;
                    const techs = techList(project.technologies);
                    return (
                      <article
                        key={`${project.title}-${index}`}
                        className="min-w-[84%] snap-start overflow-hidden rounded-[28px] bg-white shadow-[0_16px_40px_rgba(17,24,39,0.06)] lg:min-w-0"
                      >
                        {project.image ? (
                          <img src={mediaSrc(project.image, 1100)} alt="" className="h-52 w-full object-cover md:h-60" loading="lazy" />
                        ) : (
                          <div className="h-36 w-full" style={{ background: `linear-gradient(135deg, ${accent}, #111111)` }} />
                        )}
                        <div className="p-5">
                          {project.featured && (
                            <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: accent }}>
                              Featured
                            </span>
                          )}
                          <h3 className="text-xl font-semibold">{project.title}</h3>
                          {project.category && <p className="mt-1 text-sm text-[#6B7280]">{project.category}</p>}
                          {project.text && <p className="mt-3 text-sm leading-6 text-[#4B5563]">{project.text}</p>}
                          {techs.length > 0 && (
                            <p className="mt-3 text-[12px] font-medium tracking-wide text-[#9CA3AF]">{techs.join(" • ")}</p>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {href && (
                              <a href={href} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1 rounded-full bg-[#111111] px-4 text-sm font-medium text-white">
                                View project <ArrowUpRight className="h-4 w-4" />
                              </a>
                            )}
                            {github && (
                              <a href={github} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1 rounded-full bg-[#F3F4F6] px-4 text-sm font-medium">
                                GitHub <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {experience.length > 0 && (
              <section id="experience" className="public-in rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)] md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Career</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Experience</h2>
                <div className="mt-6 space-y-6 border-l border-[#E5E7EB] pl-5">
                  {experience.map((item, index) => (
                    <article key={`${item.title}-${index}`} className="-ml-[29px] flex gap-4">
                      <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white" style={{ background: accent }} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                          {[item.startDate, item.endDate || "Present"].filter(Boolean).join(" — ")}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                        {item.company && <p className="text-sm font-medium" style={{ color: accent }}>{item.company}</p>}
                        {item.location && <p className="mt-1 text-sm text-[#6B7280]">{item.location}</p>}
                        {item.text && <p className="mt-2 text-sm leading-7 text-[#4B5563]">{item.text}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {services.length > 0 && (
              <section id="services" className="public-in">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">What I do</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Services</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <article key={service.id} className="rounded-[24px] bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.05)]">
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      {service.description && <p className="mt-2 text-sm leading-6 text-[#6B7280]">{service.description}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-6">
            {skills.length > 0 && (
              <section id="skills" className="public-in rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Capabilities</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill.title}-${index}`}
                      className="rounded-full px-3.5 py-2 text-sm font-medium text-white"
                      style={{ background: accent }}
                    >
                      {skill.title || skill.text}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {(education.length > 0 || certs.length > 0) && (
              <section className="public-in rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                {education.length > 0 && (
                  <div id="education">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Education</p>
                    <div className="mt-4 space-y-4">
                      {education.map((item, index) => (
                        <div key={`${item.title}-${index}`}>
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.text && <p className="mt-1 text-sm text-[#6B7280]">{item.text}</p>}
                          {(item.startDate || item.endDate) && (
                            <p className="mt-1 text-[12px] text-[#9CA3AF]">{[item.startDate, item.endDate].filter(Boolean).join(" — ")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {certs.length > 0 && (
                  <div id="certifications" className={education.length ? "mt-6 border-t border-[#F3F4F6] pt-6" : ""}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Certifications</p>
                    <div className="mt-4 space-y-3">
                      {certs.map((item, index) => (
                        <div key={`${item.title}-${index}`}>
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.text && <p className="mt-1 text-sm text-[#6B7280]">{item.text}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section id="contact" className="public-in rounded-[28px] bg-[#111111] p-6 text-white shadow-[0_16px_40px_rgba(17,24,39,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Contact</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Let’s work</h2>
              <div className="mt-5 space-y-3 text-sm">
                {phone && <a href={`tel:${phone}`} className="block text-white/80">{phone}</a>}
                {email && <a href={`mailto:${email}`} className="block text-white/80">{email}</a>}
                {site && <a href={site} className="block text-white/80">{profile.contact.website}</a>}
                {address && <p className="text-white/55">{address}</p>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {phone && <a href={`tel:${phone}`} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#111111]">Call</a>}
                {wa && <a href={wa} className="rounded-full px-4 py-2 text-sm font-medium text-white" style={{ background: accent }}>WhatsApp</a>}
                {email && <a href={`mailto:${email}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">Email</a>}
              </div>
            </section>
          </aside>
        </div>

        {gallery.length > 0 && (
          <section id="gallery" className="public-in mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Studio</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Gallery</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((src, index) => (
                <img
                  key={src}
                  src={mediaSrc(src, 900)}
                  alt=""
                  loading="lazy"
                  className={`w-full rounded-[22px] object-cover ${index === 0 ? "col-span-2 h-56 md:h-72" : "h-40 md:h-48"}`}
                />
              ))}
            </div>
          </section>
        )}

        {socials.length > 0 && (
          <section id="social" className="public-in mt-10 rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Connect</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Social</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {socials.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-[#F7F6F3] px-4 py-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: SOCIAL_COLORS[link.kind] }}>
                    <SocialBrandIcon kind={link.kind} className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {(address || maps) && (
          <div id="location" className="mt-10">
            {embed ? <LocationSection profile={profile} /> : (
              <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <h2 className="text-2xl font-semibold">Location</h2>
                {address && <p className="mt-2 text-[#6B7280]">{address}</p>}
                {maps && (
                  <a href={maps} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white">
                    Get directions
                  </a>
                )}
              </section>
            )}
          </div>
        )}

        <section id="connect" className="public-in mt-10 rounded-[28px] bg-white px-6 py-8 text-center shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9CA3AF]">Scan or tap to connect</p>
          <div className="mx-auto mt-5 w-fit rounded-2xl bg-[#F7F6F3] p-4">
            <QRCodeSVG value={url} size={148} />
          </div>
          <p className="mt-3 font-mono text-[12px] text-[#9CA3AF]">/p/{profile.publicId}</p>
          <p className="mt-1 text-sm text-[#6B7280]">NFC enabled</p>
        </section>
      </div>
    </div>
  );
}

function Action({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: typeof Phone;
  label: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-sm"
    >
      <Icon className="h-4 w-4" style={{ color: accent }} />
      {label}
    </a>
  );
}
