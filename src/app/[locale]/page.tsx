import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AdhkarDuas,
  Hero,
  PrayerCalendar,
  QuranEntry,
  TrustStatement,
} from "@/components/home/sections";
import { Container, FixtureNotice } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import { canonicalPath, localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = t(locale);
  return {
    title: c.heroTitle,
    description: c.heroBody,
    alternates: {
      canonical: canonicalPath(locale, ""),
      languages: localeAlternates(""),
    },
  };
}

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
