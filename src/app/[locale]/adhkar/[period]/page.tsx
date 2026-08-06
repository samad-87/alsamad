import { notFound } from "next/navigation";
import { AdhkarCollectionReader } from "@/components/adhkar/collection-reader";
import { Breadcrumbs, Container, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import {
  getCategoryItemsReaderData,
  getCategoryReaderData,
} from "@/lib/adhkar/content/reader-data";
import { implementedCategories } from "@/lib/adhkar/content/structure";

export function generateStaticParams() {
  return implementedCategories().map((category) => ({
    period: category.routeSlug as string,
  }));
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
  const title = period === "morning" ? c.morning : c.evening;
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
