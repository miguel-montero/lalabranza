import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale as Locale];

  return (
    <main className="px-6 py-16 md:px-12 max-w-2xl font-body">
      <p>
        <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
      </p>
      <p>
        <a href={`mailto:${content.email}`}>{content.email}</a>
      </p>
    </main>
  );
}
