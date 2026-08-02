import { notFound } from "next/navigation";
import {
  Container,
  FixtureNotice,
  PageHeader,
  PrayerTimeCard,
  Section,
} from "@/components/ui";
import { prayerFixtures } from "@/lib/fixtures";
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
          eyebrow={c.location}
          title={c.prayer}
          description={c.permission}
        />
        <FixtureNotice locale={locale} />
        <div className="next-prayer feature-surface">
          <span className="eyebrow">{c.nextPrayer}</span>
          <strong>{locale === "ar" ? "المغرب" : "Maghrib"}</strong>
          <time>21:34</time>
          <p>{c.staticTimes}</p>
        </div>
        <div className="prayer-strip">
          {prayerFixtures.map((p, i) => (
            <PrayerTimeCard
              key={p.en}
              locale={locale}
              name={p[locale]}
              time={p.time}
              active={i === 4}
            />
          ))}
        </div>
        <div className="grid-3 disclosures">
          <article className="surface">
            <h2>{c.method}</h2>
            <p className="muted">{c.sourcePending}</p>
          </article>
          <article className="surface">
            <h2>{c.highLatitude}</h2>
            <p className="muted">{c.placeholderBody}</p>
          </article>
          <article className="surface">
            <h2>{c.manual}</h2>
            <p className="muted">{c.fixture}</p>
          </article>
        </div>
      </Container>
    </Section>
  );
}
