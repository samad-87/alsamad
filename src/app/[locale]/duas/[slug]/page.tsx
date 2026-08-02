import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumbs,
  Container,
  FixtureNotice,
  SourceReference,
} from "@/components/ui";
import { duaFixtures, loc } from "@/lib/fixtures";
import { isLocale, t } from "@/lib/i18n";
export function generateStaticParams() {
  return duaFixtures.map((d) => ({ slug: d.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const d = duaFixtures.find((x) => x.slug === slug);
  if (!d) notFound();
  const c = t(locale);
  return (
    <div className="section">
      <Container reading>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: c.duas, href: `/${locale}/duas` },
            { label: loc(locale, d.title) },
          ]}
        />
        <header className="dua-header">
          <span className="eyebrow">{loc(locale, d.category)}</span>
          <h1 className="title">{loc(locale, d.title)}</h1>
          <p className="muted">{loc(locale, d.context)}</p>
        </header>
        <FixtureNotice locale={locale} />
        <article className="religious-card surface">
          <span className="eyebrow">{c.verifiedStructure}</span>
          <p className="arabic-reading">{c.noContent}</p>
          <p className="muted">{c.placeholderBody}</p>
          <div className="placeholder-slots">
            <div>
              <strong>{c.transliteration}</strong>
              <p className="muted">—</p>
            </div>
            <div>
              <strong>{c.translation}</strong>
              <p className="muted">{c.placeholderBody}</p>
            </div>
          </div>
          <div className="action-row">
            <button className="button">{c.copy}</button>
            <button className="button">{c.share}</button>
            <button className="button">{c.audio}</button>
            <button className="button">{c.bookmark}</button>
          </div>
        </article>
        <SourceReference locale={locale} />
        <aside className="editorial-note surface">
          <span className="eyebrow">{c.editorial}</span>
          <h2>{c.context}</h2>
          <p className="muted">
            {loc(locale, d.context)} {c.sourcePending}
          </p>
        </aside>
        <section>
          <h2>{c.related}</h2>
          <div className="related-links">
            {duaFixtures
              .filter((x) => x.slug !== slug)
              .slice(0, 2)
              .map((x) => (
                <Link
                  className="surface"
                  key={x.slug}
                  href={`/${locale}/duas/${x.slug}`}
                >
                  {loc(locale, x.title)}
                </Link>
              ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
