import Image from "next/image";
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { Eyebrow } from "@/components/eyebrow";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const content = restaurantContent[locale as Locale];
  const photo = content.gallery[5];

  return (
    <main className="px-6 py-16 md:px-12 max-w-5xl mx-auto grid gap-10 md:grid-cols-2 md:items-center">
      <div className="font-body">
        <Eyebrow className="text-[var(--color-cobre-viejo)]">
          {dict.contact.eyebrow}
        </Eyebrow>
        <p className="mt-4 text-lg">{content.address}</p>
        <div className="mt-4 space-y-2 text-lg">
          <p>
            <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
          </p>
          <p>
            <a href={`mailto:${content.email}`}>{content.email}</a>
          </p>
        </div>
        <p className="mt-6 text-sm text-[var(--color-piedra-volcanica)]/70">{content.hours}</p>
      </div>
      <div className="relative aspect-[4/3]">
        <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
      </div>
    </main>
  );
}
