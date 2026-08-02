import { notFound } from "next/navigation";
import {
  Container,
  EmptyState,
  FixtureNotice,
  PageHeader,
  Section,
} from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  return (
    <Section>
      <Container>
        <PageHeader
          eyebrow={c.verifiedStructure}
          title={c.search}
          description={c.noAi}
        />
        <FixtureNotice locale={locale} />
        <label className="search-field search-large">
          <span className="sr-only">{c.search}</span>
          <input
            placeholder={
              locale === "ar"
                ? "ابحث في المصادر…"
                : "Search source-aware content…"
            }
          />
          <button className="button button-primary">{c.search}</button>
        </label>
        <div className="filter-bar">
          {[c.all, c.quran, c.adhkar, c.duas, c.learning].map((x) => (
            <button className="chip" key={x}>
              {x}
            </button>
          ))}
        </div>
        <div className="states-grid">
          <EmptyState locale={locale} />
          <EmptyState locale={locale} kind="loading" />
          <EmptyState locale={locale} kind="error" />
        </div>
      </Container>
    </Section>
  );
}
