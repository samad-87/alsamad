import { notFound } from "next/navigation";
import { Container, FixtureNotice, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  const days = Array.from({ length: 35 }, (_, i) =>
    i < 3 || i > 32 ? "" : String(i - 2),
  );
  return (
    <Section>
      <Container>
        <PageHeader
          eyebrow="1448 هـ · 2026"
          title={c.calendar}
          description={c.fixture}
        />
        <FixtureNotice locale={locale} />
        <div className="calendar-layout">
          <article className="calendar-card surface">
            <header>
              <button className="button">‹</button>
              <div>
                <strong>{locale === "ar" ? "صفر ١٤٤٨" : "Safar 1448"}</strong>
                <span className="muted">August 2026</span>
              </div>
              <button className="button">›</button>
            </header>
            <div className="calendar-grid">
              {["S", "M", "T", "W", "T", "F", "S"].map((x, i) => (
                <b key={i}>{x}</b>
              ))}
              {days.map((d, i) => (
                <span className={d === "15" ? "today-cell" : ""} key={i}>
                  {d}
                </span>
              ))}
            </div>
          </article>
          <aside className="hijri-card feature-surface">
            <span className="eyebrow">{c.daily}</span>
            <strong>15</strong>
            <h2>{locale === "ar" ? "صفر" : "Safar"}</h2>
            <p className="muted">{c.fixture}</p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
