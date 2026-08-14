import { notFound } from "next/navigation";
import {
  AdhkarDuas,
  Hero,
  PrayerCalendar,
  QuranEntry,
  TrustStatement,
} from "@/components/home/sections";
import { Container, FixtureNotice } from "@/components/ui";
import { isLocale } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Hero locale={locale} />
      <Container>
        <FixtureNotice locale={locale} />
      </Container>
      <QuranEntry locale={locale} />
      <AdhkarDuas locale={locale} />
      <PrayerCalendar locale={locale} />
      <TrustStatement locale={locale} />
    </>
  );
}
