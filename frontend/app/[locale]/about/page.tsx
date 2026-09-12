import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale as Locale];

  return (
    <main className="px-6 py-16 md:px-12 max-w-2xl">
      <address className="font-body not-italic">
        <p>{content.address}</p>
        <p>{content.hours}</p>
      </address>
      <iframe
        title="Location map"
        src={content.mapEmbedSrc}
        className="mt-8 w-full h-96 border-0"
        loading="lazy"
      />
    </main>
  );
}
