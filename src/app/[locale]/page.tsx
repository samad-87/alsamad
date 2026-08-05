import { notFound } from "next/navigation";
import {
  AdhkarDuas,
  ArticlesGuides,
  DailyJourney,
  Hero,
  Knowledge,
  MarriageJourney,
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
      <DailyJourney locale={locale} />
      <QuranEntry locale={locale} />
      <AdhkarDuas locale={locale} />
      <PrayerCalendar locale={locale} />
      <Knowledge locale={locale} />
      <MarriageJourney locale={locale} />
      <ArticlesGuides locale={locale} />
      <TrustStatement locale={locale} />
    </>
  );
}
