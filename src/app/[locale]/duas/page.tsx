import { notFound } from "next/navigation";
import {
  ContentCard,
  Container,
  FixtureNotice,
  PageHeader,
  Section,
} from "@/components/ui";
import { duaFixtures, loc } from "@/lib/fixtures";
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
          eyebrow={c.categories}
          title={c.duas}
          description={c.placeholderBody}
        />
        <FixtureNotice locale={locale} />
        <div className="general-dua-entry feature-surface">
          <div>
            <span className="general-dua-badge">General Dua</span>
            <h2>{locale === "ar" ? "أدعية عامة" : "General Duas"}</h2>
            <p className="muted">
              {locale === "ar"
                ? "أدعية إسلامية معاصرة يكتبها فريق الصمد، ومنفصلة بوضوح عن الأدعية الموثّقة."
                : "Modern Islamic supplications written by the Alsamad team, clearly separated from authenticated duas."}
            </p>
          </div>
          <a className="button button-primary" href={`/${locale}/duas/general`}>
            {c.view}
          </a>
        </div>
        <div className="filter-bar">
          <label className="search-field">
            <span className="sr-only">{c.search}</span>
            <input placeholder={`${c.search}…`} readOnly />
          </label>
          {[
            c.all,
            locale === "ar" ? "الحياة اليومية" : "Daily life",
            locale === "ar" ? "السفر" : "Travel",
          ].map((x) => (
            <button className="chip" key={x}>
              {x}
            </button>
          ))}
        </div>
        <div className="grid-3">
          {duaFixtures.map((d) => (
            <ContentCard
              key={d.slug}
              eyebrow={loc(locale, d.category)}
              title={loc(locale, d.title)}
              body={loc(locale, d.context)}
              href={`/${locale}/duas/${d.slug}`}
              action={c.view}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
