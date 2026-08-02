import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ContentCard,
  Container,
  FixtureNotice,
  PrayerTimeCard,
  Section,
} from "@/components/ui";
import { BookIcon } from "@/components/icons";
import { isLocale, t } from "@/lib/i18n";
import { prayerFixtures } from "@/lib/fixtures";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  return (
    <>
      <Section>
        <Container>
          <div className="hero feature-surface">
            <div className="hero-copy">
              <span className="eyebrow">Alsamad · Sakīnah</span>
              <h1 className="display">{c.heroTitle}</h1>
              <p>{c.heroBody}</p>
              <div className="hero-actions">
                <Link
                  className="button button-primary"
                  href={`/${locale}/adhkar/morning`}
                >
                  {c.startMorning}
                </Link>
                <Link className="button" href={`/${locale}/quran`}>
                  {c.exploreQuran}
                </Link>
              </div>
            </div>
            <div className="hero-orbit">
              <div className="orbit-inner">
                <BookIcon size={34} />
                <span>{c.daily}</span>
                <strong>1448 هـ</strong>
                <small>{c.fixture}</small>
              </div>
            </div>
          </div>
          <FixtureNotice locale={locale} />
        </Container>
      </Section>
      <Section soft>
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">{c.daily}</span>
              <h2 className="title">{c.today}</h2>
            </div>
            <span className="chip">{c.location}</span>
          </div>
          <div className="daily-grid">
            <article className="daily-main surface">
              <span className="eyebrow">{c.nextPrayer}</span>
              <strong>{locale === "ar" ? "المغرب" : "Maghrib"}</strong>
              <time>21:34</time>
              <p className="muted">{c.staticTimes}</p>
            </article>
            <ContentCard
              eyebrow={c.continueReading}
              title={
                locale === "ar"
                  ? "نموذج جلسة قراءة"
                  : "Reading session prototype"
              }
              body={c.placeholderBody}
              href={`/${locale}/quran/1`}
              action={c.view}
            />
            <ContentCard
              eyebrow={c.dailyDua}
              title={
                locale === "ar" ? "مساحة الدعاء اليومي" : "Daily dua space"
              }
              body={c.sourcePending}
              href={`/${locale}/duas/daily-guidance`}
              action={c.view}
            />
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">{c.adhkar}</span>
              <h2 className="title">
                {locale === "ar"
                  ? "لحظتان هادئتان في يومك"
                  : "Two quiet moments in your day"}
              </h2>
            </div>
          </div>
          <div className="grid-2">
            <ContentCard
              eyebrow="☼"
              title={c.morning}
              body={c.placeholderBody}
              href={`/${locale}/adhkar/morning`}
              action={c.view}
            />
            <ContentCard
              eyebrow="☾"
              title={c.evening}
              body={c.placeholderBody}
              href={`/${locale}/adhkar/evening`}
              action={c.view}
            />
          </div>
        </Container>
      </Section>
      <Section soft>
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">{c.prayer}</span>
              <h2 className="title">{c.staticTimes}</h2>
            </div>
            <Link className="button" href={`/${locale}/prayer-times`}>
              {c.view}
            </Link>
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
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="trust-block">
            <span className="eyebrow">{c.verifiedStructure}</span>
            <h2 className="title">{c.trustTitle}</h2>
            <p>{c.trustBody}</p>
          </div>
        </Container>
      </Section>
    </>
  );
}
