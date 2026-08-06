import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/quran/breadcrumb";
import { SearchBar } from "@/components/quran/search-bar";
import { SurahSidebar } from "@/components/quran/surah-sidebar";
import { Container, FixtureNotice, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import { listSurahReaderData } from "@/lib/quran/content/reader-data";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  const surahs = await listSurahReaderData();
  return (
    <Section>
      <Container>
        <Breadcrumb locale={locale} items={[{ label: c.quran }]} />
        <PageHeader
          eyebrow={c.reader}
          title={c.quran}
          description={c.placeholderBody}
        />
        <FixtureNotice locale={locale} />
        <SearchBar
          locale={locale}
          basePath={`/${locale}/quran`}
          surahs={surahs}
        />
        <SurahSidebar locale={locale} surahs={surahs} variant="index" />
      </Container>
    </Section>
  );
}
