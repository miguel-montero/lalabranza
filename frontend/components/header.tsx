import Link from "next/link";
import type { Dictionary, Locale } from "@/content/get-dictionary";
import { LocaleToggle } from "./locale-toggle";

const NAV_ITEMS: Array<{ key: keyof Dictionary["nav"]; path: string }> = [
  { key: "home", path: "" },
  { key: "menu", path: "/menu" },
  { key: "gallery", path: "/gallery" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
  { key: "reservations", path: "/reservations" },
];

export function Header({
  dictionary,
  locale,
  pathname,
}: {
  dictionary: Dictionary;
  locale: Locale;
  pathname: string;
}) {
  return (
    <header className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-12">
      <Link href={`/${locale}`} className="font-display text-xl">
        La Labranza
      </Link>
      <nav className="-mx-6 flex items-center gap-4 overflow-x-auto whitespace-nowrap px-6 md:mx-0 md:gap-6 md:overflow-visible md:px-0">
        {NAV_ITEMS.map(({ key, path }) => (
          <Link
            key={key}
            href={`/${locale}${path}`}
            className="shrink-0 font-label text-sm uppercase tracking-wide"
          >
            {dictionary.nav[key]}
          </Link>
        ))}
        <LocaleToggle currentLocale={locale} pathname={pathname} />
      </nav>
    </header>
  );
}
