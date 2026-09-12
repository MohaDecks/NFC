import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { mediaSrc } from "@/lib/media";
import { sectionTitleClass, type PublicTone } from "./tone";

export function GallerySection({ images, tone }: { images: string[]; tone: PublicTone }) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active == null || !images.length) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((current) => (current == null ? current : (current + 1) % images.length));
      if (event.key === "ArrowLeft") setActive((current) => (current == null ? current : (current - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, images.length]);

  if (!images.length) return null;

  return (
    <section className="public-in space-y-5">
      <h2 className={`${sectionTitleClass(tone)} px-1`} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        Gallery
      </h2>
      <div className="columns-2 gap-3 md:columns-3">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            className="mb-3 block w-full overflow-hidden rounded-2xl shadow-sm transition hover:opacity-90"
          >
            <img src={mediaSrc(src, 800)} alt="" className="w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {active != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setActive(null)}>
          <button type="button" className="absolute right-5 top-5 text-white" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 text-white"
                aria-label="Previous"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((active - 1 + images.length) % images.length);
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                className="absolute right-14 text-white md:right-5 md:top-auto"
                aria-label="Next"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((active + 1) % images.length);
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={mediaSrc(images[active], 1800)}
            alt=""
            className="max-h-[88vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
