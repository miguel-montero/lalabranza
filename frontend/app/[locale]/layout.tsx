import type { Metadata } from "next";
import { locales, getDictionary, type Locale } from "@/content/get-dictionary";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: "La Labranza | Viña La Quirinca",
    description: dict.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  return (
    <div lang={locale}>
      <SmoothScrollProvider>
        <Header dictionary={dictionary} locale={locale as Locale} pathname={`/${locale}`} />
        {children}
        <Footer dictionary={dictionary} />
      </SmoothScrollProvider>
    </div>
  );
}
