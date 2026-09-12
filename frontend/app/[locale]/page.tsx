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
      <section className="relative h-[80vh] min-h-[480px] w-full">
        <Image
          src={content.heroPhoto.src}
          alt={content.heroPhoto.alt}
          fill
          priority
          className="object-cover"
        />
        <FurrowDivider
          variant="hero"
          className="absolute inset-x-0 bottom-0 pointer-events-none"
        />
        <div className="absolute bottom-8 left-6 md:left-12 text-[var(--color-fibra-cruda)]">
          <Eyebrow className="text-[var(--color-fibra-cruda)]">
            {dict.home.eyebrow}
          </Eyebrow>
          <h1 className="font-display text-4xl md:text-6xl mt-2">{dict.home.headline}</h1>
          <p className="font-body text-lg mt-2 max-w-md">{dict.home.subhead}</p>
        </div>
      </section>

      <FurrowDivider />

      <section className="px-6 py-16 md:px-12 max-w-2xl">
        <p className="font-body text-lg">{dict.home.valueProp}</p>
        <Link
          href={`/${locale}/reservations`}
          className="inline-block mt-6 px-6 py-3 bg-[var(--color-vino-tinto)] text-[var(--color-fibra-cruda)] font-label uppercase tracking-wide"
        >
          {dict.home.cta}
        </Link>
      </section>
    </main>
  );
}
