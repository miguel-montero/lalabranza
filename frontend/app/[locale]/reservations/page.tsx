import { getDictionary, type Locale } from "@/content/get-dictionary";
import { ReservationForm } from "@/components/reservation-form";

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="px-6 py-16 md:px-12 max-w-xl">
      <h1 className="font-display text-3xl mb-2">{dict.reservations.title}</h1>
      <p className="font-body mb-8">{dict.reservations.intro}</p>
      <ReservationForm dictionary={dict} />
    </main>
  );
}
