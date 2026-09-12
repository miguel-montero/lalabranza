import { locales, getDictionary, type Locale } from "@/content/get-dictionary";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
      <Header dictionary={dictionary} locale={locale as Locale} pathname={`/${locale}`} />
      {children}
      <Footer dictionary={dictionary} />
    </div>
  );
}
