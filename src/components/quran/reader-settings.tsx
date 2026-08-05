"use client";

import { SettingsIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type {
  ReaderFontScale,
  ReaderLineSpacing,
  ReaderWidth,
} from "@/lib/quran-reader-client";
import { useReaderSettings } from "@/lib/quran-reader-client";

const FONT_SCALES: readonly ReaderFontScale[] = ["sm", "md", "lg", "xl"];
const WIDTHS: readonly ReaderWidth[] = ["narrow", "comfortable", "wide"];
const LINE_SPACINGS: readonly ReaderLineSpacing[] = [
  "compact",
  "comfortable",
  "relaxed",
];

export function ReaderSettings({ locale }: { locale: Locale }) {
  const c = t(locale);
  const [settings, update] = useReaderSettings();

  const fontLabels: Record<ReaderFontScale, string> = {
    sm: c.fontSizeSmall,
    md: c.fontSizeMedium,
    lg: c.fontSizeLarge,
    xl: c.fontSizeXLarge,
  };
  const widthLabels: Record<ReaderWidth, string> = {
    narrow: c.widthNarrow,
    comfortable: c.widthComfortable,
    wide: c.widthWide,
  };
  const spacingLabels: Record<ReaderLineSpacing, string> = {
    compact: c.spacingCompact,
    comfortable: c.spacingComfortable,
    relaxed: c.spacingRelaxed,
  };

  return (
    <details className="reader-settings-details">
      <summary className="chip">
        <SettingsIcon size={16} /> {c.settings}
      </summary>
      <div className="reader-settings-panel surface">
        <div className="reader-settings-row">
          <span>{c.fontSize}</span>
          <div className="segmented" role="group" aria-label={c.fontSize}>
            {FONT_SCALES.map((scale) => (
              <button
                key={scale}
                type="button"
                aria-pressed={settings.fontScale === scale}
                onClick={() => update({ fontScale: scale })}
              >
                {fontLabels[scale]}
              </button>
            ))}
          </div>
        </div>
        <div className="reader-settings-row">
          <span>{c.readerWidth}</span>
          <div className="segmented" role="group" aria-label={c.readerWidth}>
            {WIDTHS.map((width) => (
              <button
                key={width}
                type="button"
                aria-pressed={settings.width === width}
                onClick={() => update({ width })}
              >
                {widthLabels[width]}
              </button>
            ))}
          </div>
        </div>
        <div className="reader-settings-row">
          <span>{c.lineSpacing}</span>
          <div className="segmented" role="group" aria-label={c.lineSpacing}>
            {LINE_SPACINGS.map((spacing) => (
              <button
                key={spacing}
                type="button"
                aria-pressed={settings.lineSpacing === spacing}
                onClick={() => update({ lineSpacing: spacing })}
              >
                {spacingLabels[spacing]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
