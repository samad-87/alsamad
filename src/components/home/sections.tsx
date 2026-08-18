import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { loc } from "@/lib/fixtures";
import { ArrowIcon, HeartHandsIcon } from "@/components/icons";
import { Container, Section } from "@/components/ui";
import { getQuranOverallStatus } from "@/lib/quran/content/reader-data";
import { getCategoryReaderData } from "@/lib/adhkar/content/reader-data";

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
        <div className="hero home-reveal">
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

export async function QuranEntry({ locale }: { locale: Locale }) {
  const c = t(locale);
  const snapshot = await getQuranOverallStatus();
  const statusIcon =
    snapshot.status === "available"
      ? "✓"
      : snapshot.status === "pending"
        ? "◐"
        : "◌";
  const statusLabel =
    snapshot.status === "available"
      ? c.quranStatusAvailable
      : snapshot.status === "pending"
        ? c.quranStatusPending
        : c.quranStatusEmpty;
  return (
    <Section>
      <Container>
        <div className="today-quran surface-grouped home-reveal">
          <div className="today-quran-heading">
            <div>
              <span className="eyebrow">{c.today}</span>
              <h2 className="title">{c.quran}</h2>
            </div>
            <span className="chip status-chip">
              {statusIcon} {statusLabel}
            </span>
          </div>
          <Link className="button today-quran-action" href={`/${locale}/quran`}>
            {c.surahs}
          </Link>
        </div>
      </Container>
    </Section>
  );
}

export async function AdhkarDuas({ locale }: { locale: Locale }) {
  const c = t(locale);
  const [morning, evening] = await Promise.all([
    getCategoryReaderData("morning"),
    getCategoryReaderData("evening"),
  ]);
  const practices = [
    {
      title: c.morning,
      href: `/${locale}/adhkar/morning`,
      symbol: "☼",
      status: morning?.status ?? "empty",
    },
    {
      title: c.evening,
      href: `/${locale}/adhkar/evening`,
      symbol: "☾",
      status: evening?.status ?? "empty",
    },
  ] as const;
  const statusLabel = (status: (typeof practices)[number]["status"]) =>
    status === "available"
      ? c.adhkarStatusAvailable
      : status === "pending"
        ? c.adhkarStatusPending
        : c.adhkarStatusEmpty;

  return (
    <section className="section section-soft home-practice-region">
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.daily}</span>
            <h2 className="title">{c.adhkar}</h2>
          </div>
        </div>
        <div className="home-practice-grid">
          {practices.map((practice) => (
            <Link
              className="home-practice-entry surface-interactive"
              href={practice.href}
              key={practice.href}
            >
              <span className="home-entry-symbol" aria-hidden="true">
                {practice.symbol}
              </span>
              <span className="home-entry-copy">
                <h3>{practice.title}</h3>
                <span className="home-entry-status">
                  {statusLabel(practice.status)}
                </span>
              </span>
              <span className="card-action">
                {c.view} <ArrowIcon size={16} />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function PrayerCalendar({ locale }: { locale: Locale }) {
  const c = t(locale);
  const utilities = [
    {
      title: c.prayer,
      href: `/${locale}/prayer-times`,
      status: c.setupRequired,
      detail: c.noLiveStatus,
    },
    {
      title: c.calendar,
      href: `/${locale}/calendar`,
      status: c.setupRequired,
      detail: c.noLiveStatus,
    },
    { title: c.tasbeeh, href: `/${locale}/tasbeeh` },
    { title: c.duas, href: `/${locale}/duas` },
  ] as const;

  return (
    <section className="section home-utility-region">
      <Container>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{c.daily}</span>
            <h2 className="title">
              {c.prayer} · {c.calendar} · {c.tasbeeh} · {c.duas}
            </h2>
          </div>
        </div>
        <div className="home-utility-group surface-grouped">
          <div className="home-utility-grid">
            {utilities.map((utility) => (
              <Link
                className="home-utility-entry surface-interactive"
                href={utility.href}
                key={utility.href}
              >
                <h3>{utility.title}</h3>
                {"status" in utility ? (
                  <span className="home-utility-status">
                    <span>{utility.status}</span>
                    <span>{utility.detail}</span>
                  </span>
                ) : null}
                <span className="card-action">
                  {c.view} <ArrowIcon size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
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
