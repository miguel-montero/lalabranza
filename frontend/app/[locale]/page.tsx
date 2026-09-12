import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { Eyebrow } from "@/components/eyebrow";
import { FurrowDivider } from "@/components/furrow-divider";
import { HeroIntro } from "@/components/hero-intro";
import { Reveal } from "@/components/reveal";
import { RevealStagger } from "@/components/reveal-stagger";

const CTA_LINK_CLASSES =
  "inline-block mt-6 px-6 py-3 bg-[var(--color-vino-tinto)] text-[var(--color-fibra-cruda)] font-label uppercase tracking-wide";

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
        <HeroIntro
          className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 text-[var(--color-fibra-cruda)]"
          eyebrow={dict.home.eyebrow}
          headline={dict.home.headline}
          subhead={dict.home.subhead}
        />
      </section>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 max-w-3xl mx-auto text-center">
          <p className="font-body text-lg">{dict.home.valueProp}</p>
          <Link href={`/${locale}/reservations`} className={CTA_LINK_CLASSES}>
            {dict.home.cta}
          </Link>
        </section>
      </Reveal>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 grid gap-10 md:grid-cols-2 md:items-center max-w-5xl mx-auto">
          <div>
            <h2 className="font-display text-2xl md:text-3xl">{dict.home.originTitle}</h2>
            <p className="font-body mt-4">{dict.home.originBody}</p>
          </div>
          <div className="relative aspect-[4/3]">
            <Image
              src={content.gallery[1].src}
              alt={content.gallery[1].alt}
              fill
              className="object-cover"
            />
          </div>
        </section>
      </Reveal>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 grid gap-10 md:grid-cols-2 md:items-center max-w-5xl mx-auto">
          <div className="relative aspect-[4/3] md:order-first">
            <Image
              src={content.gallery[2].src}
              alt={content.gallery[2].alt}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl">{dict.home.landTitle}</h2>
            <p className="font-body mt-4">{dict.home.landBody}</p>
          </div>
        </section>
      </Reveal>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 grid gap-10 md:grid-cols-2 md:items-center max-w-5xl mx-auto">
          <div>
            <h2 className="font-display text-2xl md:text-3xl">{dict.home.foodTitle}</h2>
            <p className="font-body mt-4">{dict.home.foodBody}</p>
          </div>
          <div className="relative aspect-[4/3]">
            <Image
              src={content.gallery[0].src}
              alt={content.gallery[0].alt}
              fill
              className="object-cover"
            />
          </div>
        </section>
      </Reveal>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 grid gap-10 md:grid-cols-2 md:items-center max-w-5xl mx-auto">
          <div className="relative aspect-[4/3] md:order-first">
            <Image
              src={content.gallery[4].src}
              alt={content.gallery[4].alt}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl">{dict.home.wineTitle}</h2>
            <p className="font-body mt-4">{dict.home.wineBody}</p>
          </div>
        </section>
      </Reveal>

      <FurrowDivider />

      <section className="px-6 py-16 md:px-12 max-w-5xl mx-auto">
        <Eyebrow className="text-[var(--color-cobre-viejo)]">
          {dict.home.atmosphereEyebrow}
        </Eyebrow>
        <RevealStagger className="mt-6 grid gap-8 sm:grid-cols-3">
          {[content.gallery[3], content.gallery[5], content.gallery[1]].map((photo) => (
            <div key={photo.src} className="relative aspect-square" data-reveal-item>
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
            </div>
          ))}
        </RevealStagger>
        <Link
          href={`/${locale}/gallery`}
          className="inline-block mt-6 font-label text-sm uppercase tracking-wide underline"
        >
          {dict.nav.gallery}
        </Link>
      </section>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl">{dict.home.visitTitle}</h2>
          <address className="font-body not-italic mt-4">
            <p>{content.address}</p>
            <p>{content.hours}</p>
          </address>
          <Link
            href={`/${locale}/about`}
            className="inline-block mt-4 font-label text-sm uppercase tracking-wide underline"
          >
            {dict.home.visitCta}
          </Link>
        </section>
      </Reveal>

      <FurrowDivider />

      <Reveal>
        <section className="px-6 py-16 md:px-12 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl">{dict.home.closingTitle}</h2>
          <p className="font-body mt-4">{dict.home.closingBody}</p>
          <Link href={`/${locale}/reservations`} className={CTA_LINK_CLASSES}>
            {dict.home.cta}
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
