import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ContentCard,
  Container,
  EmptyState,
  FixtureNotice,
  PageHeader,
  PrayerTimeCard,
  Section,
  SourceReference,
} from "@/components/ui";
import { LocaleSwitcher, FooterGroup } from "@/components/shell";
import { ThemeSwitcher } from "@/components/client-controls";
import { isLocale, t } from "@/lib/i18n";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

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
          eyebrow="Sakīnah"
          title={c.showcase}
          description={c.fixture}
        />
        <FixtureNotice locale={locale} />
        <h2>{locale === "ar" ? "الأزرار والتحكم" : "Buttons & controls"}</h2>
        <div className="action-row">
          <button className="button button-primary">Primary</button>
          <button className="button">Secondary</button>
          <span className="chip">Status</span>
          <LocaleSwitcher locale={locale} />
          <ThemeSwitcher locale={locale} />
        </div>
        <h2>{locale === "ar" ? "البطاقات" : "Cards"}</h2>
        <div className="grid-3">
          <ContentCard
            eyebrow="ContentCard"
            title={c.dailyDua}
            body={c.placeholderBody}
          />
          <PrayerTimeCard
            locale={locale}
            name={locale === "ar" ? "المغرب" : "Maghrib"}
            time="21:34"
            active
          />
          <EmptyState locale={locale} />
        </div>
        <h2>{c.source}</h2>
        <SourceReference locale={locale} />
        <div className="skeleton surface">
          <span />
          <span />
          <span />
        </div>
        <div className="showcase-footer surface">
          <FooterGroup
            title="FooterLinkGroup"
            links={[
              [c.quran, `/${locale}/quran`],
              [c.duas, `/${locale}/duas`],
            ]}
          />
        </div>
      </Container>
    </Section>
  );
}
