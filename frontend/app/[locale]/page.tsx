import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { Eyebrow } from "@/components/eyebrow";
import { FurrowDivider } from "@/components/furrow-divider";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const content = restaurantContent[locale as Locale];

  return (
    <main>
      <section className="relative h-[80vh] min-h-[480px] w-full overflow-hidden">
        <Image
          src={content.heroPhoto.src}
          alt={content.heroPhoto.alt}
          fill
          priority
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-piedra-volcanica)]/85 via-[var(--color-piedra-volcanica)]/25 to-transparent"
        />
        <FurrowDivider
          variant="hero"
          className="absolute inset-x-0 bottom-0 pointer-events-none"
        />
        <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 text-[var(--color-fibra-cruda)]">
          <Eyebrow className="text-[var(--color-lana-dorada)]">
            {dict.home.eyebrow}
          </Eyebrow>
          <h1 className="font-display text-4xl md:text-6xl mt-2">{dict.home.headline}</h1>
          <p className="font-body text-lg mt-2 max-w-md">{dict.home.subhead}</p>
        </div>
      </section>

      <FurrowDivider />

      <section className="px-6 py-16 md:px-12 grid gap-10 md:grid-cols-2 md:items-center max-w-5xl mx-auto">
        <div>
          <p className="font-body text-lg">{dict.home.valueProp}</p>
          <Link
            href={`/${locale}/reservations`}
            className="inline-block mt-6 px-6 py-3 bg-[var(--color-vino-tinto)] text-[var(--color-fibra-cruda)] font-label uppercase tracking-wide"
          >
            {dict.home.cta}
          </Link>
        </div>
        <div className="relative aspect-[4/3]">
          <Image
            src={content.gallery[4].src}
            alt={content.gallery[4].alt}
            fill
            className="object-cover"
          />
        </div>
      </section>

      <FurrowDivider />

      <section className="px-6 py-16 md:px-12 max-w-5xl mx-auto">
        <Eyebrow className="text-[var(--color-cobre-viejo)]">{dict.home.highlightsEyebrow}</Eyebrow>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {[
            { photo: content.gallery[1], caption: dict.home.highlight1 },
            { photo: content.gallery[2], caption: dict.home.highlight2 },
            { photo: content.gallery[0], caption: dict.home.highlight3 },
          ].map(({ photo, caption }) => (
            <div key={photo.src}>
              <div className="relative aspect-square">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
              </div>
              <p className="font-label text-sm uppercase tracking-wide mt-3">{caption}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
