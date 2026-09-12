import Link from "next/link";
import type { Locale } from "@/content/get-dictionary";

const OTHER_LOCALE: Record<Locale, Locale> = { en: "es", es: "en" };
const LABEL: Record<Locale, string> = { en: "English", es: "Español" };

export function LocaleToggle({
  currentLocale,
  pathname,
}: {
  currentLocale: Locale;
  pathname: string;
}) {
  const target = OTHER_LOCALE[currentLocale];
  const rest = pathname.replace(/^\/(en|es)/, "");
  const href = `/${target}${rest}`;

  return (
    <Link href={href} className="shrink-0 px-2 py-2.5 font-label text-sm underline">
      {LABEL[target]}
    </Link>
  );
}
