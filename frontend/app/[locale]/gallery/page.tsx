import Image from "next/image";
import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { RevealStagger } from "@/components/reveal-stagger";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale as Locale];

  return (
    <main className="px-6 pt-32 pb-16 md:px-12">
      <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {content.gallery.map((photo) => (
          <div key={photo.src} className="relative aspect-[4/3]" data-reveal-item>
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
          </div>
        ))}
      </RevealStagger>
    </main>
  );
}
