import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/quran/breadcrumb";
import { EmptyReaderState } from "@/components/quran/empty-reader-state";
import { LoadingSkeleton } from "@/components/quran/loading-skeleton";
import { ReaderToolbar } from "@/components/quran/reader-toolbar";
import { SurahHeader } from "@/components/quran/surah-header";
import { SurahSidebar } from "@/components/quran/surah-sidebar";
import { VerseContainer } from "@/components/quran/verse-container";
import { Container } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { isLocale, t } from "@/lib/i18n";
import {
  getSurahReaderData,
  listSurahReaderData,
  verseSlotsFor,
} from "@/lib/quran/content/reader-data";
import { surahStructures } from "@/lib/quran/content/structure";

export function generateStaticParams() {
  return surahStructures.map((surah) => ({ surah: surah.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}) {
  const { locale, surah: surahSlug } = await params;
  if (!isLocale(locale)) notFound();
  const surah = await getSurahReaderData(surahSlug);
  if (!surah) notFound();
  const c = t(locale);
  const slots = verseSlotsFor(surah);
  const containerId = `verse-container-${surah.number}`;
  const surahLabel = `${locale === "ar" ? "سورة" : "Surah"} ${surah.number}`;

  return (
    <div className="section">
      <Container>
        <div className="quran-layout">
          <Suspense
            fallback={<LoadingSkeleton rows={6} aria-label={c.surahs} />}
          >
            <SurahSidebarData locale={locale} />
          </Suspense>
          <div className="quran-main">
            <Breadcrumb
              locale={locale}
              items={[
                { label: c.quran, href: `/${locale}/quran` },
                { label: surahLabel },
              ]}
            />
            <SurahHeader locale={locale} surah={surah} />
            <ReaderToolbar
              locale={locale}
              surahNumber={surah.number}
              containerId={containerId}
            />
            {surah.status === "empty" && (
              <EmptyReaderState locale={locale} kind="no-content-imported" />
            )}
            {surah.status === "pending" && (
              <EmptyReaderState locale={locale} kind="import-pending" />
            )}
            {surah.status === "available" && (
              <Suspense
                fallback={<LoadingSkeleton rows={4} aria-label={c.reader} />}
              >
                <VerseContainer
                  locale={locale}
                  slots={slots}
                  containerId={containerId}
                />
              </Suspense>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

async function SurahSidebarData({ locale }: { locale: Locale }) {
  const surahs = await listSurahReaderData();
  return <SurahSidebar locale={locale} surahs={surahs} />;
}
