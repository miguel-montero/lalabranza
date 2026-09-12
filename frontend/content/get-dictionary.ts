import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

export type Locale = "en" | "es";
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, es };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export const locales: Locale[] = ["en", "es"];
export const defaultLocale: Locale = "en";
