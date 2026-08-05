import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { loc } from "@/lib/fixtures";
import { ArrowIcon, BookIcon, HeartHandsIcon } from "@/components/icons";
import { Container, ContentCard, Section } from "@/components/ui";

/**
 * Homepage sections — Mobile First, Desktop Excellent.
 * No real religious content, prayer times, Hijri dates, or scholarly
 * claims are rendered here. Every placeholder is explicitly labeled.
 */

export function Hero({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section>
      <Container>
        <div className="hero feature-surface home-reveal">
          <div className="hero-copy">
            <span className="eyebrow">Alsamad · Sakīnah</span>
            <h1 className="display">{c.heroTitle}</h1>
            <p>{c.heroBody}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/${locale}/quran`}>
                {c.exploreQuran}
              </Link>
              <Link className="button" href={`/${locale}/adhkar`}>
                {c.heroSecondaryCta}
              </Link>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-inner">
              <BookIcon size={34} />
              <span>{c.daily}</span>
              <small>{c.fixture}</small>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

const dailyJourneyCategories = [
  { ar: "آية اليوم", en: "Daily Ayah" },
  { ar: "الذكر", en: "Dhikr" },
  { ar: "الدعاء", en: "Dua" },
  { ar: "تأمل مراجَع", en: "Reviewed reflection" },
  { ar: "متابعة القراءة", en: "Reading continuation" },
] as const;

export function DailyJourney({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section soft>
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.daily}</span>
            <h2 className="title">{c.dailyJourneyTitle}</h2>
          </div>
          <span className="chip status-chip">◌ {c.placeholderNoticeShort}</span>
        </div>
        <div className="daily-journey-card surface home-reveal">
          <p className="muted">{c.dailyJourneyBody}</p>
          <div className="daily-journey-categories">
            <span className="eyebrow">{c.dailyJourneyFuture}</span>
            <div className="chip-row">
              {dailyJourneyCategories.map((category) => (
                <span className="chip" key={category.en}>
                  {loc(locale, category)}
                </span>
              ))}
            </div>
          </div>
          <div className="source-row">
            <span className="chip">✓ {c.verifiedStructure}</span>
            <span>{c.sourcePending}</span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function QuranEntry({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section>
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.quranSectionEyebrow}</span>
            <h2 className="title">{c.quran}</h2>
          </div>
          <Link className="button" href={`/${locale}/quran`}>
            {c.surahs}
          </Link>
        </div>
        <div className="quran-entry-grid">
          <div className="quran-entry-main feature-surface home-reveal">
            <BookIcon size={30} />
            <p>{c.quranSectionBody}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/${locale}/quran`}>
                {c.exploreQuran}
              </Link>
              <Link className="button" href={`/${locale}/quran/1`}>
                {c.continueReadingCta}
              </Link>
            </div>
          </div>
          <div className="quran-entry-side">
            <ContentCard
              eyebrow={c.continueReading}
              title={c.continueReadingPlaceholder}
              body={c.placeholderBody}
              href={`/${locale}/quran/1`}
              action={c.view}
            />
            <ContentCard
              eyebrow={c.settings}
              title={c.readerWidth}
              body={c.placeholderBody}
              href={`/${locale}/quran/1`}
              action={c.view}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function AdhkarDuas({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section soft>
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.adhkar}</span>
            <h2 className="title">
              {locale === "ar"
                ? "لحظتان هادئتان، ودعاء"
                : "Two quiet moments, and dua"}
            </h2>
          </div>
        </div>
        <div className="grid-3">
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
          <ContentCard
            eyebrow={c.categories}
            title={c.duas}
            body={c.placeholderBody}
            href={`/${locale}/duas`}
            action={c.view}
          />
        </div>
      </Container>
    </Section>
  );
}

export function PrayerCalendar({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section>
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.prayer}</span>
            <h2 className="title">{c.staticTimes}</h2>
          </div>
        </div>
        <div className="grid-2">
          <div className="content-card surface placeholder-card">
            <span className="eyebrow">{c.prayer}</span>
            <h3>{c.nextPrayer}</h3>
            <p className="muted">{c.setupRequired}</p>
            <div className="source-row">
              <span className="chip">◌ {c.noLiveStatus}</span>
            </div>
            <Link className="card-action" href={`/${locale}/prayer-times`}>
              {c.view} →
            </Link>
          </div>
          <div className="content-card surface placeholder-card">
            <span className="eyebrow">{c.calendar}</span>
            <h3>{c.calendar}</h3>
            <p className="muted">{c.setupRequired}</p>
            <div className="source-row">
              <span className="chip">◌ {c.noLiveStatus}</span>
            </div>
            <Link className="card-action" href={`/${locale}/calendar`}>
              {c.view} →
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function Knowledge({ locale }: { locale: Locale }) {
  const c = t(locale);
  const entries = [
    { label: c.quran, href: `/${locale}/quran` },
    { label: c.adhkar, href: `/${locale}/adhkar` },
    { label: c.duas, href: `/${locale}/duas` },
    { label: c.search, href: `/${locale}/search` },
  ];
  return (
    <Section soft>
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.verifiedStructure}</span>
            <h2 className="title">{c.knowledgeTitle}</h2>
          </div>
        </div>
        <p className="muted knowledge-body">{c.knowledgeBody}</p>
        <div className="knowledge-links">
          {entries.map((entry) => (
            <Link
              key={entry.href}
              className="chip knowledge-chip"
              href={entry.href}
            >
              {entry.label} <ArrowIcon size={16} />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function MarriageJourney({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section>
      <Container>
        <div className="marriage-journey-card feature-surface home-reveal">
          <HeartHandsIcon size={30} />
          <span className="chip status-chip">
            {c.futureModule} · {c.comingSoon}
          </span>
          <h2 className="title">{c.marriageJourneyTitle}</h2>
          <p>{c.marriageJourneyBody}</p>
          <p className="muted">{c.marriageJourneyNote}</p>
        </div>
      </Container>
    </Section>
  );
}

export function ArticlesGuides({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section soft>
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.learning}</span>
            <h2 className="title">{c.articlesTitle}</h2>
          </div>
          <span className="chip status-chip">{c.comingSoon}</span>
        </div>
        <p className="muted">{c.articlesBody}</p>
      </Container>
    </Section>
  );
}

export function TrustStatement({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <Section>
      <Container>
        <div className="trust-block">
          <span className="eyebrow">{c.verifiedStructure}</span>
          <h2 className="title">{c.trustTitle}</h2>
          <p>{c.trustBody}</p>
          <p className="muted">{c.trustAiNote}</p>
        </div>
      </Container>
    </Section>
  );
}
