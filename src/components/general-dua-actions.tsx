"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function GeneralDuaActions({
  locale,
  text,
  title,
}: {
  locale: Locale;
  text: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const labels =
    locale === "ar"
      ? {
          copy: "نسخ",
          copied: "تم النسخ",
          share: "مشاركة",
          favourite: "المفضلة قريباً",
        }
      : {
          copy: "Copy",
          copied: "Copied",
          share: "Share",
          favourite: "Favourite soon",
        };

  async function copyDua() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareDua() {
    if (navigator.share) {
      await navigator.share({ title, text, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="action-row general-dua-actions">
      <button className="button button-primary" onClick={copyDua}>
        {copied ? labels.copied : labels.copy}
      </button>
      <button className="button" onClick={shareDua}>
        {labels.share}
      </button>
      <button className="button" disabled title={labels.favourite}>
        ♡ {labels.favourite}
      </button>
    </div>
  );
}
