import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, FixtureNotice, PageHeader, Section } from "@/components/ui";
import { surahFixtures } from "@/lib/fixtures";
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
          eyebrow={c.reader}
          title={c.quran}
          description={c.placeholderBody}
        />
        <FixtureNotice locale={locale} />
        <div className="surah-grid">
          {surahFixtures.map((s) => (
            <Link
              className="surah-row surface"
              href={`/${locale}/quran/${s.slug}`}
              key={s.slug}
            >
              <span className="surah-number">{s.number}</span>
              <div>
                <strong className="surah-ar">{s.ar}</strong>
                <span className="muted">{s.en}</span>
              </div>
              <small>
                {s.verses} {locale === "ar" ? "آية" : "verses"}
              </small>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
