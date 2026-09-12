import Image from "next/image";
import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { Reveal } from "@/components/reveal";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale as Locale];
  const hasRealCoordinates = !content.mapEmbedSrc.includes("[COORDINATES]");
  const estatePhoto = content.gallery[3];

  return (
    <main className="px-6 py-16 md:px-12 max-w-5xl mx-auto">
      <Reveal className="grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <address className="font-body not-italic">
            <p>{content.address}</p>
            <p>{content.hours}</p>
          </address>
          {hasRealCoordinates ? (
            <iframe
              title="Location map"
              src={content.mapEmbedSrc}
              className="mt-8 w-full h-96 border-0"
              loading="lazy"
            />
          ) : (
            <div className="mt-8 w-full h-96 border border-[var(--color-cobre-viejo)]/40 flex items-center justify-center">
              <p className="font-label text-sm uppercase tracking-wide text-[var(--color-piedra-volcanica)]/70">
                Map available once the address is confirmed
              </p>
            </div>
          )}
        </div>
        <div className="relative aspect-[4/3]">
          <Image src={estatePhoto.src} alt={estatePhoto.alt} fill className="object-cover" />
        </div>
      </Reveal>
    </main>
  );
}
