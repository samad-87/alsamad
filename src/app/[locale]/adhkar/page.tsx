import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdhkarCategoryExplorer } from "@/components/adhkar/category-explorer";
import {
  Breadcrumbs,
  Container,
  FixtureNotice,
  PageHeader,
  Section,
} from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import { listCategoryReaderData } from "@/lib/adhkar/content/reader-data";
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
    title: c.adhkar,
    description: c.adhkarIndexBody,
    alternates: {
      canonical: canonicalPath(locale, "/adhkar"),
      languages: localeAlternates("/adhkar"),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  const categories = await listCategoryReaderData();
  const labels: Record<string, string> = {
    morning: c.morning,
    evening: c.evening,
    sleep: c.adhkarSleep,
    travel: c.adhkarTravel,
    prayer: c.adhkarPrayerCategory,
    general: c.adhkarGeneral,
  };

  return (
    <Section>
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: c.adhkar }]} />
        <PageHeader
          eyebrow={c.daily}
          title={c.adhkar}
          description={c.adhkarIndexBody}
        />
        <FixtureNotice locale={locale} />
        <AdhkarCategoryExplorer
          locale={locale}
          categories={categories}
          labels={labels}
        />
      </Container>
    </Section>
  );
}
