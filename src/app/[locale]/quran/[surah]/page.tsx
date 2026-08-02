import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  Container,
  FixtureNotice,
  SourceReference,
} from "@/components/ui";
import { surahFixtures } from "@/lib/fixtures";
import { isLocale, t } from "@/lib/i18n";
export function generateStaticParams() {
  return surahFixtures.map((s) => ({ surah: s.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}) {
  const { locale, surah } = await params;
  if (!isLocale(locale)) notFound();
  const s = surahFixtures.find((x) => x.slug === surah);
  if (!s) notFound();
  const c = t(locale);
  return (
    <div className="section">
      <Container reading>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: c.quran, href: `/${locale}/quran` },
            { label: s.ar },
          ]}
        />
        <header className="reader-header feature-surface">
          <span className="eyebrow">{c.reader}</span>
          <h1 className="title">{s.ar}</h1>
          <p>
            {s.en} · {s.verses} {locale === "ar" ? "آية" : "verses"}
          </p>
          <div className="reader-settings">
            <button className="chip">{c.translation}</button>
            <button className="chip">{c.settings}</button>
            <button className="chip">{c.audio}</button>
          </div>
        </header>
        <FixtureNotice locale={locale} />
        <div className="verse-list">
          {[1, 2, 3].map((n) => (
            <article className="verse-row" key={n}>
              <div className="verse-marker">{n}</div>
              <p className="arabic-reading">{c.noContent}</p>
              <p className="muted">{c.placeholderBody}</p>
              <div className="verse-actions">
                <button>{c.translation}</button>
                <button>{c.tafsir}</button>
                <button>{c.audio}</button>
                <button>{c.bookmark}</button>
              </div>
            </article>
          ))}
        </div>
        <SourceReference locale={locale} />
      </Container>
    </div>
  );
}
