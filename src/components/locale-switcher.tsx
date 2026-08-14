"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function switchLocalePath(pathname: string, target: Locale): string {
  if (!/^\/(?:ar|en)(?:\/|$)/.test(pathname)) {
    return `/${target}`;
  }

  return pathname.replace(/^\/(?:ar|en)(?=\/|$)/, `/${target}`);
}

function LocaleSwitcherLink({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target: Locale = locale === "ar" ? "en" : "ar";
  const label = target === "ar" ? "العربية" : "English";
  const short = target === "ar" ? "AR" : "EN";
  const query = searchParams.toString();
  const href = `${switchLocalePath(pathname, target)}${query ? `?${query}` : ""}`;

  return (
    <Link className="button locale-button" href={href} aria-label={label}>
      <span className="locale-label-full" aria-hidden="true">
        {label}
      </span>
      <span className="locale-label-short" aria-hidden="true">
        {short}
      </span>
    </Link>
  );
}

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const target: Locale = locale === "ar" ? "en" : "ar";
  const label = target === "ar" ? "العربية" : "English";
  const short = target === "ar" ? "AR" : "EN";

  return (
    <Suspense
      fallback={
        <Link
          className="button locale-button"
          href={`/${target}`}
          aria-label={label}
        >
          <span className="locale-label-full" aria-hidden="true">
            {label}
          </span>
          <span className="locale-label-short" aria-hidden="true">
            {short}
          </span>
        </Link>
      }
    >
      <LocaleSwitcherLink locale={locale} />
    </Suspense>
  );
}
