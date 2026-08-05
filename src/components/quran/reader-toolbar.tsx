import type { Locale } from "@/lib/i18n";
import { BookmarkButton } from "./bookmark-button";
import { ReaderSettings } from "./reader-settings";
import { ReadingModeSwitcher } from "./reading-mode-switcher";
import { ReadingProgress } from "./reading-progress";
import { TafsirToggle } from "./tafsir-toggle";
import { TranslationToggle } from "./translation-toggle";

export function ReaderToolbar({
  locale,
  surahNumber,
  containerId,
}: {
  locale: Locale;
  surahNumber: number;
  containerId: string;
}) {
  return (
    <div className="reader-toolbar-sticky">
      <div className="reader-toolbar-group">
        <ReadingModeSwitcher locale={locale} />
        <TranslationToggle locale={locale} />
        <TafsirToggle locale={locale} />
        <ReaderSettings locale={locale} />
        <BookmarkButton locale={locale} reference={`surah:${surahNumber}`} />
      </div>
      <ReadingProgress locale={locale} targetId={containerId} />
    </div>
  );
}
