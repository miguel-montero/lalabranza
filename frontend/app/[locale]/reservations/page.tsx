import Image from "next/image";
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { ReservationForm } from "@/components/reservation-form";

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const photo = restaurantContent[locale as Locale].heroPhoto;

  return (
    <main className="px-6 py-16 md:px-12 max-w-5xl mx-auto grid gap-10 md:grid-cols-2">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl mb-2">{dict.reservations.title}</h1>
        <p className="font-body mb-8">{dict.reservations.intro}</p>
        <ReservationForm dictionary={dict} />
      </div>
      <div className="relative hidden md:block aspect-[3/4]">
        <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
      </div>
    </main>
  );
}
