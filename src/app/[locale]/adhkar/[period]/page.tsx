import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdhkarCollectionReader } from "@/components/adhkar/collection-reader";
import { Breadcrumbs, Container, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import {
  getCategoryItemsReaderData,
  getCategoryReaderData,
} from "@/lib/adhkar/content/reader-data";
import { implementedCategories } from "@/lib/adhkar/content/structure";
import { canonicalPath, localeAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return implementedCategories().map((category) => ({
    period: category.routeSlug as string,
  }));
}

function periodTitle(period: string, c: ReturnType<typeof t>) {
  return period === "morning" ? c.morning : c.evening;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; period: string }>;
}): Promise<Metadata> {
  const { locale, period } = await params;
  if (!isLocale(locale)) return {};
  const category = await getCategoryReaderData(period);
  if (!category || !category.routeSlug) notFound();
  const c = t(locale);
  const title = periodTitle(period, c);
  const statusBody =
    category.status === "available"
      ? c.adhkarStatusAvailableBody
      : category.status === "pending"
        ? c.adhkarStatusPendingBody
        : c.adhkarStatusEmptyBody;
  const path = `/adhkar/${category.routeSlug}`;
  return {
    title,
    description: `${title} — ${statusBody}`,
    alternates: {
      canonical: canonicalPath(locale, path),
      languages: localeAlternates(path),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; period: string }>;
}) {
  const { locale, period } = await params;
  if (!isLocale(locale)) notFound();
  const category = await getCategoryReaderData(period);
  if (!category || !category.routeSlug) notFound();
  const c = t(locale);
  const title = periodTitle(period, c);
  const items = await getCategoryItemsReaderData(category.id);

  return (
    <Section>
      <Container reading>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: c.adhkar, href: `/${locale}/adhkar` },
            { label: title },
          ]}
        />
        <PageHeader
          eyebrow={c.reader}
          title={title}
          description={c.adhkarIndexBody}
        />
        <AdhkarCollectionReader
          locale={locale}
          status={category.status}
          items={items}
        />
      </Container>
    </Section>
  );
}
