"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function isDesktopNavigationCurrent(
  pathname: string,
  href: string,
): boolean {
  return href.endsWith("/ar") || href.endsWith("/en")
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavigation({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const c = t(locale);
  const base = `/${locale}`;
  const destinations = [
    [base, c.today],
    [`${base}/quran`, c.quran],
    [`${base}/adhkar`, c.adhkar],
    [`${base}/duas`, c.duas],
    [`${base}/prayer-times`, c.prayer],
  ] as const;

  return (
    <nav aria-label={c.menu} className="desktop-nav">
      {destinations.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={
            isDesktopNavigationCurrent(pathname, href) ? "page" : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
