import { notFound } from "next/navigation";
import { DuaCategoryExplorer } from "@/components/duas/category-explorer";
import {
  Breadcrumbs,
  Container,
  FixtureNotice,
  PageHeader,
  Section,
} from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import { listCategoryReaderData } from "@/lib/duas/content/reader-data";

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
    general: c.duaCategoryGeneral,
    family: c.duaCategoryFamily,
    health: c.duaCategoryHealth,
    provision: c.duaCategoryProvision,
    travel: c.duaCategoryTravel,
    forgiveness: c.duaCategoryForgiveness,
    gratitude: c.duaCategoryGratitude,
    protection: c.duaCategoryProtection,
  };

  return (
    <Section>
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: c.duas }]} />
        <PageHeader
          eyebrow={c.categories}
          title={c.duas}
          description={c.duaIndexBody}
        />
        <FixtureNotice locale={locale} />
        <DuaCategoryExplorer
          locale={locale}
          categories={categories}
          labels={labels}
        />
      </Container>
    </Section>
  );
}
