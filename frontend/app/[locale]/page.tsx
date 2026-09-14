import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { Eyebrow } from "@/components/eyebrow";
import { FurrowDivider } from "@/components/furrow-divider";
import { HeroIntro } from "@/components/hero-intro";
import { Reveal } from "@/components/reveal";
import { RevealStagger } from "@/components/reveal-stagger";
import { HeroShaderCanvas } from "@/components/hero-shader-canvas";
import { CinematicStorySection } from "@/components/cinematic-story-section";
import { RevealImage } from "@/components/reveal-image";
import { TaglineReveal } from "@/components/tagline-reveal";

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
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src={content.heroPhoto.src}
          alt={content.heroPhoto.alt}
          fill
          priority
          className="object-cover"
        />
        <HeroShaderCanvas src={content.heroPhoto.src} className="absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-piedra-volcanica)]/90 via-[var(--color-piedra-volcanica)]/30 to-transparent"
        />
        <FurrowDivider
          variant="hero"
          className="absolute inset-x-0 bottom-0 pointer-events-none"
        />
        <HeroIntro
          className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12 text-[var(--color-fibra-cruda)]"
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

      <CinematicStorySection
        title={dict.home.originTitle}
        body={dict.home.originBody}
        photo={content.gallery[1]}
        align="left"
      />

      <CinematicStorySection
        title={dict.home.landTitle}
        body={dict.home.landBody}
        photo={content.gallery[10]}
        align="right"
      />

      <CinematicStorySection
        title={dict.home.foodTitle}
        body={dict.home.foodBody}
        photo={content.gallery[7]}
        align="left"
      />

      <CinematicStorySection
        title={dict.home.wineTitle}
        body={dict.home.wineBody}
        photo={content.gallery[4]}
        align="right"
      />

      <FurrowDivider />

      <section className="px-6 py-16 md:px-12 max-w-5xl mx-auto">
        <Eyebrow className="text-[var(--color-cobre-viejo)]">
          {dict.home.atmosphereEyebrow}
        </Eyebrow>
        <RevealStagger className="mt-6 grid grid-cols-2 md:grid-cols-3 grid-flow-dense gap-4 auto-rows-[minmax(0,1fr)]">
          <div className="relative row-span-2 aspect-[3/4] md:aspect-auto" data-reveal-item>
            <Image
              src={content.gallery[8].src}
              alt={content.gallery[8].alt}
              fill
              className="object-cover"
            />
          </div>
          {[content.gallery[9], content.gallery[3], content.gallery[5], content.gallery[0]].map(
            (photo) => (
              <div key={photo.src} className="relative aspect-square" data-reveal-item>
                <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
              </div>
            ),
          )}
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

      <section className="px-6 py-24 md:px-12 max-w-2xl mx-auto text-center">
        <TaglineReveal
          text={dict.home.closingTitle}
          className="font-display text-3xl md:text-5xl text-[var(--color-piedra-volcanica)]"
        />
        <Reveal>
          <div>
            <p className="font-body mt-6">{dict.home.closingBody}</p>
            <Link href={`/${locale}/reservations`} className={CTA_LINK_CLASSES}>
              {dict.home.cta}
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
