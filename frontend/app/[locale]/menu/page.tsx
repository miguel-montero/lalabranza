import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { FurrowDivider } from "@/components/furrow-divider";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await getDictionary(locale as Locale);
  const content = restaurantContent[locale as Locale];

  return (
    <main className="px-6 py-16 md:px-12 max-w-3xl">
      {content.menu.map((category, i) => (
        <section key={category.category} className="mb-12">
          {i > 0 && <FurrowDivider className="mb-8" />}
          <h2 className="font-display text-2xl mb-4">{category.category}</h2>
          <ul>
            {category.items.map((item) => (
              <li
                key={item.name}
                className="flex justify-between items-baseline py-3 border-b border-[var(--color-cobre-viejo)]/20"
              >
                <div>
                  <p className="font-body">{item.name}</p>
                  <p className="font-body text-sm text-[var(--color-piedra-volcanica)]/70">
                    {item.description}
                  </p>
                </div>
                <span className="font-label">{item.price}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
