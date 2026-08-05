import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/quran/breadcrumb";
import { LoadingSkeleton } from "@/components/quran/loading-skeleton";
import { ReaderToolbar } from "@/components/quran/reader-toolbar";
import { SurahHeader } from "@/components/quran/surah-header";
import { SurahSidebar } from "@/components/quran/surah-sidebar";
import { VerseContainer } from "@/components/quran/verse-container";
import { Container } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
import {
  findMockSurah,
  mockSurahs,
  mockVerseSlots,
} from "@/lib/quran-reader-mock";

export function generateStaticParams() {
  return mockSurahs.map((surah) => ({ surah: surah.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}) {
  const { locale, surah: surahSlug } = await params;
  if (!isLocale(locale)) notFound();
  const surah = findMockSurah(surahSlug);
  if (!surah) notFound();
  const c = t(locale);
  const slots = mockVerseSlots(surah);
  const containerId = `verse-container-${surah.number}`;
  const surahLabel = `${locale === "ar" ? "سورة" : "Surah"} ${surah.number}`;

  return (
    <div className="section">
      <Container>
        <div className="quran-layout">
          <Suspense
            fallback={<LoadingSkeleton rows={6} aria-label={c.surahs} />}
          >
            <SurahSidebar locale={locale} />
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
            <Suspense
              fallback={<LoadingSkeleton rows={4} aria-label={c.reader} />}
            >
              <VerseContainer
                locale={locale}
                slots={slots}
                containerId={containerId}
              />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  );
}
