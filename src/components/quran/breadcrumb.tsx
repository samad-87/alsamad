import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

export function Breadcrumb({
  locale,
  items,
}: {
  locale: Locale;
  items: readonly BreadcrumbItem[];
}) {
  const c = t(locale);
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link href={`/${locale}`}>{c.today}</Link>
      {items.map((item, index) => (
        <span key={index}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
        </span>
      ))}
    </nav>
  );
}
